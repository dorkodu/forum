import { SchemaContext } from "./_schema";
import sage from "@dorkodu/sage-server";
import { ErrorCode } from "../types/error_codes";
import { blockUserSchema, followUserSchema, getUserDiscussionsSchema, getUserFollowersSchema, getUserFollowingSchema, getUserNotificationsSchema, getUserSchema, searchUserSchema } from "../schemas/user";
import { z } from "zod";
import auth from "./auth";
import pg from "../pg";
import { IUser, IUserParsed, IUserRaw, iUserSchema } from "../types/user";
import { IDiscussion, IDiscussionParsed, IDiscussionRaw, iDiscussionSchema } from "../types/discussion";
import { snowflake } from "../lib/snowflake";
import { INotification, INotificationParsed, iNotificationSchema } from "../types/notification";
import { notificationTypes } from "../types/types";
import { date } from "../lib/date";

const getUser = sage.resource(
  {} as SchemaContext,
  {} as z.infer<typeof getUserSchema>,
  async (arg, ctx): Promise<{ data?: IUser[], error?: ErrorCode }> => {
    const parsed = getUserSchema.safeParse(arg);
    if (!parsed.success) return { error: ErrorCode.Default };

    const info = await auth.getAuthInfo(ctx);

    const { username } = parsed.data;

    if (username) {
      const [result]: [IUserRaw?] = await pg`
        SELECT 
          u.id, u.name, u.username, u.bio, u.join_date, 
          u.follower_count, u.following_count,
        ${info ?
          pg`
          (EXISTS (SELECT * FROM user_follows WHERE follower_id = u.id AND following_id = ${info.userId})) AS following,
          (EXISTS (SELECT * FROM user_follows WHERE following_id = u.id AND follower_id = ${info.userId})) AS follower,` :
          pg`FALSE AS following, FALSE AS follower,`
        }
        ${info ?
          pg`
          (EXISTS (SELECT * FROM user_blocks WHERE blocker_id = u.id AND blocking_id = ${info.userId})) AS blocking,
          (EXISTS (SELECT * FROM user_blocks WHERE blocking_id = u.id AND blocker_id = ${info.userId})) AS blocker` :
          pg`NULL AS blocking, NULL AS blocker`
        }
        FROM users u
        WHERE username_ci = ${username.toLowerCase()}
      `;
      if (!result) return { error: ErrorCode.Default };

      const res = iUserSchema.safeParse(result);

      if (res.success) {
        ctx.userId = res.data.id;
        return { data: [res.data] };
      }

      return { error: ErrorCode.Default };
    }
    else {
      let ids: string[] | undefined = undefined;
      if (parsed.data.ids) ids = parsed.data.ids;
      else if (ctx.userIds) ids = Array.from(ctx.userIds);
      if (!ids) return { error: ErrorCode.Default };
      if (ids.length > 20) return { error: ErrorCode.Default };

      const result = await pg<IUserRaw[]>`
        SELECT 
          u.id, u.name, u.username, u.bio, u.join_date, 
          u.follower_count, u.following_count,
        ${info ?
          pg`
          (EXISTS (SELECT * FROM user_follows WHERE follower_id = u.id AND following_id = ${info.userId})) AS following,
          (EXISTS (SELECT * FROM user_follows WHERE following_id = u.id AND follower_id = ${info.userId})) AS follower,` :
          pg`FALSE AS following, FALSE AS follower,`
        }
        ${info ?
          pg`
          (EXISTS (SELECT * FROM user_blocks WHERE blocker_id = u.id AND blocking_id = ${info.userId})) AS blocking,
          (EXISTS (SELECT * FROM user_blocks WHERE blocking_id = u.id AND blocker_id = ${info.userId})) AS blocker` :
          pg`NULL AS blocking, NULL AS blocker`
        }
        FROM users u
        WHERE u.id IN ${pg(ids)}
      `;

      const res: IUserParsed[] = [];
      result.forEach(user => {
        const parsed = iUserSchema.safeParse(user);
        if (parsed.success) res.push(parsed.data);
      })

      return { data: res };
    }
  }
)

const searchUser = sage.resource(
  {} as SchemaContext,
  {} as z.infer<typeof searchUserSchema>,
  async (arg, ctx): Promise<{ data?: IUser[], error?: ErrorCode }> => {
    const parsed = searchUserSchema.safeParse(arg);
    if (!parsed.success) return { error: ErrorCode.Default };

    const info = await auth.getAuthInfo(ctx);

    const { name, username, anchorId, type } = parsed.data;
    if (!name && !username) return { error: ErrorCode.Default };
    if (name && username) return { error: ErrorCode.Default };

    const result = await pg`
      SELECT 
        u.id, u.name, u.username, u.bio, u.join_date, 
        u.follower_count, u.following_count,
      ${info ?
        pg`
        (EXISTS (SELECT * FROM user_follows WHERE follower_id = u.id AND following_id = ${info.userId})) AS following,
        (EXISTS (SELECT * FROM user_follows WHERE following_id = u.id AND follower_id = ${info.userId})) AS follower,` :
        pg`FALSE AS following, FALSE AS follower,`
      }
      ${info ?
        pg`
        (EXISTS (SELECT * FROM user_blocks WHERE blocker_id = u.id AND blocking_id = ${info.userId})) AS blocking,
        (EXISTS (SELECT * FROM user_blocks WHERE blocking_id = u.id AND blocker_id = ${info.userId})) AS blocker` :
        pg`NULL AS blocking, NULL AS blocker`
      }
      FROM users u
      WHERE 
        ${name ? pg`u.name_ci LIKE ${`${name.toLowerCase()}%`}` : pg``} 
        ${username ? pg`u.username_ci LIKE ${`${username.toLowerCase()}%`}` : pg``}
      ${anchorId === "-1" ? pg`` : type === "newer" ? pg`AND u.id<${anchorId}` : pg`AND u.id>${anchorId}`}
      ORDER BY u.id ${type === "newer" ? pg`DESC` : pg`ASC`}
      LIMIT 20
    `;

    const res: IUserParsed[] = [];
    result.forEach(argument => {
      const parsed = iUserSchema.safeParse(argument);
      if (parsed.success) res.push(parsed.data);
    });

    return { data: res };
  }
)

const blockUser = sage.resource(
  {} as SchemaContext,
  {} as z.infer<typeof blockUserSchema>,
  async (arg, ctx): Promise<{ data?: {}, error?: ErrorCode }> => {
    const parsed = followUserSchema.safeParse(arg);
    if (!parsed.success) return { error: ErrorCode.Default };

    const info = await auth.getAuthInfo(ctx);
    if (!info) return { error: ErrorCode.Default };

    const { userId, type } = parsed.data;

    const result = await pg.begin(async (pg) => {
      const [result0]: [{ exists: boolean }?] = await pg`
        SELECT EXISTS (
          SELECT * FROM user_blocks
          WHERE blocker_id=${info.userId} AND blocking_id=${userId}
        )
      `;
      if (!result0) return false;

      // Return error if trying to:
      // - self block
      // - unblock an user that is not being blocked
      // - block an user that is already being blocked
      if (info.userId === userId) return false;
      else if (!result0.exists && type === false) return false;
      else if (result0.exists && type === true) return false;

      if (type) {
        const row = {
          id: snowflake.id("user_blocks"),
          blockerId: info.userId,
          blockingId: userId,
        }

        const [[result1], [result2]] = await Promise.all([
          pg`
            SELECT EXISTS (
              SELECT * FROM user_follows
              WHERE follower_id=${info.userId} AND following_id=${userId}
            )`,
          pg`
            SELECT EXISTS (
              SELECT * FROM user_follows
              WHERE follower_id=${userId} AND following_id=${info.userId}
            )`,
        ]);

        const blockerFollow = result1?.exists as boolean | undefined;
        const blockingFollow = result2?.exists as boolean | undefined;

        const [result3] = await Promise.all([
          pg`INSERT INTO user_blocks ${pg(row)}`,

          ...(blockerFollow ? [
            pg`UPDATE users SET following_count=following_count-1 WHERE id=${info.userId}`,
            pg`UPDATE users SET follower_count=follower_count-1 WHERE id=${userId}`,
            pg`DELETE FROM user_follows WHERE follower_id=${info.userId} AND following_id=${userId}`,
          ] : []),

          ...(blockingFollow ? [
            pg`UPDATE users SET following_count=following_count-1 WHERE id=${userId}`,
            pg`UPDATE users SET follower_count=follower_count-1 WHERE id=${info.userId}`,
            pg`DELETE FROM user_follows WHERE follower_id=${userId} AND following_id=${info.userId}`,
          ] : []),
        ]);
        if (result3.count === 0) return false;
      }
      else {
        const result1 = await pg`DELETE FROM user_blocks WHERE blocker_id=${info.userId} AND blocking_id=${userId}`;
        if (result1.count === 0) return false;
      }

      return true;
    });

    if (!result) return { error: ErrorCode.Default };
    return { data: {} };
  }
)

const followUser = sage.resource(
  {} as SchemaContext,
  {} as z.infer<typeof followUserSchema>,
  async (arg, ctx): Promise<{ data?: {}, error?: ErrorCode }> => {
    const parsed = followUserSchema.safeParse(arg);
    if (!parsed.success) return { error: ErrorCode.Default };

    const info = await auth.getAuthInfo(ctx);
    if (!info) return { error: ErrorCode.Default };

    const { userId, type } = parsed.data;

    const result = await pg.begin(async (pg) => {
      // Check if any of the users have blocked each other
      const [[result1], [result2]] = await Promise.all([
        pg`SELECT EXISTS (SELECT * FROM user_blocks WHERE blocker_id=${info.userId} AND blocking_id=${userId})`,
        pg`SELECT EXISTS (SELECT * FROM user_blocks WHERE blocker_id=${userId} AND blocking_id=${info.userId})`,
      ]);
      const blocker = result1?.exists as boolean | undefined;
      const blocking = result2?.exists as boolean | undefined;
      if (blocker === undefined) return false;
      if (blocking === undefined) return false;
      if (blocker === true) return false;
      if (blocking === true) return false;

      const [result0]: [{ exists: boolean }?] = await pg`
        SELECT EXISTS (SELECT * FROM user_follows WHERE follower_id=${info.userId} AND following_id=${userId})
      `;
      if (!result0) return false;

      // Return error if trying to:
      // - self follow
      // - unfollow an user that is not being followed
      // - follow an user that is already being followed
      if (info.userId === userId) return false;
      else if (!result0.exists && type === false) return false;
      else if (result0.exists && type === true) return false;

      if (type) {
        const row = {
          id: snowflake.id("user_follows"),
          followerId: info.userId,
          followingId: userId,
        }

        const [result1, result2, result3] = await Promise.all([
          pg`UPDATE users SET following_count=following_count+1 WHERE id=${info.userId}`,
          pg`UPDATE users SET follower_count=follower_count+1 WHERE id=${userId}`,
          pg`INSERT INTO user_follows ${pg(row)}`,
        ]);
        if (!result1) return false;
        if (!result2) return false;
        if (!result3) return false;

        // Once user is successfully followed, try to create a notification
        queryCreateNotification(row.followingId, row.followerId, row.followerId, null, "userFollow",);
      }
      else {
        const [result1, result2, result3] = await Promise.all([
          pg`UPDATE users SET following_count=following_count-1 WHERE id=${info.userId}`,
          pg`UPDATE users SET follower_count=follower_count-1 WHERE id=${userId}`,
          pg`DELETE FROM user_follows WHERE follower_id=${info.userId} AND following_id=${userId}`,
        ]);
        if (!result1) return false;
        if (!result2) return false;
        if (!result3) return false;
      }

      return true;
    });

    if (!result) return { error: ErrorCode.Default };
    return { data: {} };
  }
)

const getUserDiscussions = sage.resource(
  {} as SchemaContext,
  {} as z.infer<typeof getUserDiscussionsSchema>,
  async (arg, ctx): Promise<{ data?: IDiscussion[], error?: ErrorCode }> => {
    const parsed = getUserDiscussionsSchema.safeParse(arg);
    if (!parsed.success) return { error: ErrorCode.Default };

    const info = await auth.getAuthInfo(ctx);

    const { anchorId, type } = parsed.data;
    const userId = parsed.data.userId ?? ctx.userId;
    if (!userId) return { error: ErrorCode.Default };

    const result = await pg.begin(async (pg) => {
      // If logged in & target user is blocking current user
      if (info) {
        const [result0]: [{ exists: boolean }?] = await pg`
        SELECT EXISTS (
          SELECT * FROM user_blocks
          WHERE blocker_id=${userId} AND blocking_id=${info.userId}
        )
      `;
        if (!result0) return undefined;
        if (result0.exists) return undefined;
      }

      const result0 = await pg<IDiscussionRaw[]>`
        SELECT
          d.id, d.user_id, d.date, d.title, d.readme,
          d.favourite_count, d.argument_count, d.comment_count,
          d.last_update_date,
        ${info ? pg`(df.user_id IS NOT NULL) AS favourited` : pg`FALSE AS favourited`}
        FROM discussions d
        ${info ?
          pg`
          LEFT JOIN discussion_favourites df
          ON d.id=df.discussion_id AND df.user_id=${info.userId}` :
          pg``
        }
        WHERE d.user_id=${userId}
        ${anchorId === "-1" ? pg`` : type === "newer" ? pg`AND d.id<${anchorId}` : pg`AND d.id>${anchorId}`}
        ORDER BY d.id ${type === "newer" ? pg`DESC` : pg`ASC`}
        LIMIT 20
      `;

      const res: IDiscussionParsed[] = [];
      result0.forEach(argument => {
        const parsed = iDiscussionSchema.safeParse(argument);
        if (parsed.success) res.push(parsed.data);
      });

      return res;
    });

    if (!result) return { error: ErrorCode.Default };
    return { data: result };
  }
)

const getUserFollowers = sage.resource(
  {} as SchemaContext,
  {} as z.infer<typeof getUserFollowersSchema>,
  async (arg, ctx): Promise<{ data?: IUser[], error?: ErrorCode }> => {
    const parsed = getUserFollowersSchema.safeParse(arg);
    if (!parsed.success) return { error: ErrorCode.Default };

    const info = await auth.getAuthInfo(ctx);

    const { anchorId, type } = parsed.data;
    const userId = parsed.data.userId ?? ctx.userId;
    if (!userId) return { error: ErrorCode.Default };

    const result = await pg.begin(async (pg) => {
      // If logged in & target user is blocking current user
      if (info) {
        const [result0]: [{ exists: boolean }?] = await pg`
        SELECT EXISTS (
          SELECT * FROM user_blocks
          WHERE blocker_id=${userId} AND blocking_id=${info.userId}
        )
      `;
        if (!result0) return undefined;
        if (result0.exists) return undefined;
      }

      const result = await pg<IUserRaw[]>`
        SELECT 
          u.id, u.name, u.username, u.bio, u.join_date, 
          u.follower_count, u.following_count,
        ${info ?
          pg`
          (EXISTS (SELECT * FROM user_follows WHERE follower_id = u.id AND following_id = ${info.userId})) AS following,
          (EXISTS (SELECT * FROM user_follows WHERE following_id = u.id AND follower_id = ${info.userId})) AS follower,` :
          pg`FALSE AS following, FALSE AS follower,`
        }
        ${info ?
          pg`
          (EXISTS (SELECT * FROM user_blocks WHERE blocker_id = u.id AND blocking_id = ${info.userId})) AS blocking,
          (EXISTS (SELECT * FROM user_blocks WHERE blocking_id = u.id AND blocker_id = ${info.userId})) AS blocker` :
          pg`NULL AS blocking, NULL AS blocker`
        }
        FROM users u
        WHERE u.id IN (SELECT follower_id FROM user_follows WHERE following_id=${userId})
        ${anchorId === "-1" ? pg`` : type === "newer" ? pg`AND u.id<${anchorId}` : pg`AND u.id>${anchorId}`}
        ORDER BY u.id ${type === "newer" ? pg`DESC` : pg`ASC`}
        LIMIT 20
      `;

      const res: IUserParsed[] = [];
      result.forEach(argument => {
        const parsed = iUserSchema.safeParse(argument);
        if (parsed.success) res.push(parsed.data);
      })

      return res;
    });

    if (!result) return { error: ErrorCode.Default };
    return { data: result };
  }
)

const getUserFollowing = sage.resource(
  {} as SchemaContext,
  {} as z.infer<typeof getUserFollowingSchema>,
  async (arg, ctx): Promise<{ data?: IUser[], error?: ErrorCode }> => {
    const parsed = getUserFollowingSchema.safeParse(arg);
    if (!parsed.success) return { error: ErrorCode.Default };

    const info = await auth.getAuthInfo(ctx);

    const { anchorId, type } = parsed.data;
    const userId = parsed.data.userId ?? ctx.userId;
    if (!userId) return { error: ErrorCode.Default };

    const result = await pg.begin(async (pg) => {
      // If logged in & target user is blocking current user
      if (info) {
        const [result0]: [{ exists: boolean }?] = await pg`
          SELECT EXISTS (
            SELECT * FROM user_blocks
            WHERE blocker_id=${userId} AND blocking_id=${info.userId}
          )
        `;
        if (!result0) return undefined;
        if (result0.exists) return undefined;
      }

      const result1 = await pg<IUserRaw[]>`
        SELECT
          u.id, u.name, u.username, u.bio, u.join_date,
          u.follower_count, u.following_count,
        ${info ?
          pg`
          (EXISTS (SELECT * FROM user_follows WHERE follower_id = u.id AND following_id = ${info.userId})) AS following,
          (EXISTS (SELECT * FROM user_follows WHERE following_id = u.id AND follower_id = ${info.userId})) AS follower,` :
          pg`FALSE AS following, FALSE AS follower,`
        }
        ${info ?
          pg`
          (EXISTS (SELECT * FROM user_blocks WHERE blocker_id = u.id AND blocking_id = ${info.userId})) AS blocking,
          (EXISTS (SELECT * FROM user_blocks WHERE blocking_id = u.id AND blocker_id = ${info.userId})) AS blocker` :
          pg`NULL AS blocking, NULL AS blocker`
        }
        FROM users u
        WHERE u.id IN (SELECT following_id FROM user_follows WHERE follower_id=${userId})
        ${anchorId === "-1" ? pg`` : type === "newer" ? pg`AND u.id<${anchorId}` : pg`AND u.id>${anchorId}`}
        ORDER BY u.id ${type === "newer" ? pg`DESC` : pg`ASC`}
        LIMIT 20
      `;

      const res: IUserParsed[] = [];
      result1.forEach(argument => {
        const parsed = iUserSchema.safeParse(argument);
        if (parsed.success) res.push(parsed.data);
      })

      return res;
    });

    if (!result) return { error: ErrorCode.Default };
    return { data: result };
  }
)

const getUserNotifications = sage.resource(
  {} as SchemaContext,
  {} as z.infer<typeof getUserNotificationsSchema>,
  async (arg, ctx): Promise<{ data?: INotification[], error?: ErrorCode }> => {
    const parsed = getUserNotificationsSchema.safeParse(arg);
    if (!parsed.success) return { error: ErrorCode.Default };

    const info = await auth.getAuthInfo(ctx);
    if (!info) return { error: ErrorCode.Default };

    const { anchorId, type } = parsed.data;

    const [result0, _result1] = await pg.begin(pg => [
      pg`
        SELECT 
          un.id, un.target_id, un.current_id,
          un.parent_id, un.child_id, un.type, un.date
        FROM user_notifications un
        WHERE un.target_id=${info.userId}
        ${anchorId === "-1" ? pg`` :
          type === "newer" ? pg`AND un.id<${anchorId}` : pg`AND un.id>${anchorId}`}
        AND (
          NOT EXISTS (
            SELECT * FROM user_blocks ub
            WHERE 
              (ub.blocker_id=${info.userId} AND un.current_id=ub.blocking_id) OR
              (ub.blocking_id=${info.userId} AND un.current_id=ub.blocker_id)
          )
        )
        ORDER BY un.id ${type === "newer" ? pg`DESC` : pg`ASC`}
        LIMIT 20`,
      pg`UPDATE users SET has_notification=false WHERE id=${info.userId}`,
    ]);

    const res: INotificationParsed[] = [];
    result0.forEach(notification => {
      const parsed = iNotificationSchema.safeParse(notification);
      if (parsed.success) res.push(parsed.data);
    })

    if (ctx.userIds === undefined) ctx.userIds = new Set();
    res.forEach((notification) => { ctx.userIds?.add(notification.currentId) });

    await queryAddNotificationContent(res);

    return { data: res };
  }
)

/**
 * Creates a notification for a given action to a user.
 * Notification creation is not a high priority action,
 * so if any error occures, the program can continue without throwing errors
 * and there is no need to use awaits with this function (if not necessary).
 * Notifications shouldn't be deleted once created, 
 * only delete old notifications using a cron-jobs.
 * @param targetId User that will see the notification.
 * @param currentId User that triggered the notification.
 * @param parentId Non-nullable entity value. For ex.
 *  userFollow -> userId, discussionFavourite -> discussionId,
 *  discussionArgument/discussionComment -> discussionId,
 *  argumentVote -> discussionId
 * @param childId Nullable entity value. For ex.
 *  userFollow -> null, discussionFavourite -> null,
 *  discussionArgument/discussionComment -> argumentId/commentId,
 *  argumentVote -> argumentId
 * @param type Type of the notification (smallint, signed 2 bytes).
 * @returns Notification creation status.
 */
async function queryCreateNotification(
  targetId: string,
  currentId: string,
  parentId: string,
  childId: string | null,
  type: keyof typeof notificationTypes
): Promise<boolean> {
  // Don't allow user to trigger notification for themselves
  if (targetId === currentId) return false;

  const row = {
    id: snowflake.id("user_notifications"),
    targetId,
    currentId,
    parentId,
    childId,
    type: notificationTypes[type],
    date: date.utc(),
  }

  try {
    const [result0, _result1] = await pg.begin(pg => [
      pg`INSERT INTO user_notifications ${pg(row)}`,
      pg`UPDATE users SET has_notification=true WHERE id=${targetId}`
    ]);

    return !!result0.count;
  } catch {
    return false;
  }
}

async function queryAddNotificationContent(notifications: INotification[]) {
  const _discussions = notifications.filter((n) =>
    n.type === notificationTypes.discussionFavourite ||
    n.type === notificationTypes.argumentVote ||
    n.type === notificationTypes.discussionArgument ||
    n.type === notificationTypes.discussionComment
  );
  const _arguments = notifications.filter((n) => n.type === notificationTypes.argumentVote || n.type === notificationTypes.discussionArgument);
  const _comments = notifications.filter((n) => n.type === notificationTypes.discussionComment);

  const [result0, result1, result2]: any = await Promise.all([
    _discussions.length > 0 && pg`SELECT id, substring(title FROM 1 FOR 50) AS content FROM discussions WHERE id IN ${pg(_discussions.map(a => a.parentId))}`,
    _arguments.length > 0 && pg`SELECT id, substring(content FROM 1 FOR 50) AS content FROM discussion_arguments WHERE id IN ${pg(_arguments.map(a => a.childId || "-1"))}`,
    _comments.length > 0 && pg`SELECT id, substring(content FROM 1 FOR 50) AS content FROM discussion_comments WHERE id IN ${pg(_comments.map(a => a.childId || "-1"))}`,
  ])

  result0 && _discussions.forEach(n => {
    result0.forEach((r: { id: string, content: string }) => {
      if (n.parentId !== r.id) return;
      if (!n.content) n.content = [];
      n.content.push(r.content);
    })
  });

  result1 && _arguments.forEach(n => {
    result1.forEach((r: { id: string, content: string }) => {
      if (n.childId !== r.id) return;
      if (!n.content) n.content = [];
      n.content.push(r.content);
    })
  });

  result2 && _comments.forEach(n => {
    result2.forEach((r: { id: string, content: string }) => {
      if (n.childId !== r.id) return;
      if (!n.content) n.content = [];
      n.content.push(r.content);
    })
  });
}

export default {
  getUser,
  searchUser,

  blockUser,
  followUser,

  getUserDiscussions,
  getUserFollowers,
  getUserFollowing,
  getUserNotifications,

  queryCreateNotification,
}