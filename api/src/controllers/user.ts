import { SchemaContext } from "./_schema";
import sage from "@dorkodu/sage-server";
import { ErrorCode } from "../types/error_codes";
import { followUserSchema, getUserDiscussionsSchema, getUserFollowersSchema, getUserFollowingSchema, getUserSchema } from "../schemas/user";
import { z } from "zod";
import auth from "./auth";
import pg from "../pg";
import { IUser, IUserParsed, IUserRaw, iUserSchema } from "../types/user";
import { IDiscussion, IDiscussionParsed, IDiscussionRaw, iDiscussionSchema } from "../types/discussion";
import { snowflake } from "../lib/snowflake";

const getUser = sage.resource(
  {} as SchemaContext,
  {} as z.infer<typeof getUserSchema>,
  async (arg, ctx): Promise<{ data?: IUser[], error?: ErrorCode }> => {
    const parsed = getUserSchema.safeParse(arg);
    if (!parsed.success) return { error: ErrorCode.Default };

    const info = await auth.getAuthInfo(ctx);
    if (!info) return { error: ErrorCode.Default };

    const username = parsed.data.username;

    if (username) {
      const [result]: [IUserRaw?] = await pg`
        SELECT id, name, username, bio, join_date, follower_count, following_count
        FROM users WHERE username=${username}
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
        SELECT id, name, username, bio, join_date, follower_count, following_count
        FROM users WHERE id IN ${pg(ids)}
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

const editUser = sage.resource(
  {} as SchemaContext,
  undefined,
  async (_arg, _ctx): Promise<{ data?: {}, error?: ErrorCode }> => {
    return { data: {} };
  }
)

const searchUser = sage.resource(
  {} as SchemaContext,
  undefined,
  async (_arg, _ctx): Promise<{ data?: {}, error?: ErrorCode }> => {
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
    if (!info) return { error: ErrorCode.Default };

    const { anchorId, type } = parsed.data;
    const userId = parsed.data.userId ?? ctx.userId;
    if (!userId) return { error: ErrorCode.Default };

    const result = await pg<IDiscussionRaw[]>`
      SELECT 
        d.id, d.user_id, d.date, d.title, d.readme, 
        d.favourite_count, d.argument_count, d.comment_count,
        d.last_update_date, d.last_argument_date, d.last_comment_date,
        (df.user_id IS NOT NULL) AS favourited
      FROM discussions d
      LEFT JOIN discussion_favourites df
      ON d.id=df.discussion_id AND df.user_id=${info.userId}
      WHERE d.user_id=${userId}
      ${anchorId === "-1" ? pg`` : type === "newer" ? pg`AND d.id>${anchorId}` : pg`AND d.id<${anchorId}`}
      ORDER BY d.id ${anchorId === "-1" ? pg`DESC` : type === "newer" ? pg`ASC` : pg`DESC`}
      LIMIT 20
    `;

    const res: IDiscussionParsed[] = [];
    result.forEach(argument => {
      const parsed = iDiscussionSchema.safeParse(argument);
      if (parsed.success) res.push(parsed.data);
    })

    return { data: res };
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

    const [result0]: [{ count: string }?] = await pg`
      SELECT COUNT(*) FROM user_follows 
      WHERE follower_id=${info.userId} AND following_id=${userId}
    `;
    if (!result0) return { error: ErrorCode.Default };

    // Return error if trying to:
    // - unfollow an user that is not being followed
    // - follow and user that is already being followed
    if (result0.count === "0" && type === false) return { error: ErrorCode.Default };
    else if (result0.count !== "0" && type === true) return { error: ErrorCode.Default };

    if (type) {
      const row = {
        id: snowflake.id("user_follows"),
        followerId: info.userId,
        followingId: userId,
      }

      const [result1, result2, result3] = await pg.begin(pg => [
        pg`UPDATE users SET following_count=following_count+1 WHERE id=${info.userId}`,
        pg`UPDATE users SET follower_count=follower_count+1 WHERE id=${userId}`,
        pg`INSERT INTO user_follows ${pg(row)}`,
      ]);
      if (!result1) return { error: ErrorCode.Default };
      if (!result2) return { error: ErrorCode.Default };
      if (!result3) return { error: ErrorCode.Default };
    }
    else {
      const [result1, result2, result3] = await pg.begin(pg => [
        pg`UPDATE users SET following_count=following_count-1 WHERE id=${info.userId}`,
        pg`UPDATE users SET follower_count=follower_count-1 WHERE id=${userId}`,
        pg`DELETE FROM user_follows WHERE follower_id=${info.userId} AND following_id=${userId}`,
      ]);
      if (!result1) return { error: ErrorCode.Default };
      if (!result2) return { error: ErrorCode.Default };
      if (!result3) return { error: ErrorCode.Default };
    }

    return { data: {} };
  }
)

const getUserFollowers = sage.resource(
  {} as SchemaContext,
  {} as z.infer<typeof getUserFollowersSchema>,
  async (arg, ctx): Promise<{ data?: IUser[], error?: ErrorCode }> => {
    const parsed = getUserFollowersSchema.safeParse(arg);
    if (!parsed.success) return { error: ErrorCode.Default };

    const info = await auth.getAuthInfo(ctx);
    if (!info) return { error: ErrorCode.Default };

    const { anchorId, type } = parsed.data;
    const userId = parsed.data.userId ?? ctx.userId;
    if (!userId) return { error: ErrorCode.Default };

    const result = await pg<IUserRaw[]>`
      SELECT id, name, username, bio, join_date, follower_count, following_count FROM users
      WHERE id IN (SELECT follower_id FROM user_follows WHERE following_id=${userId})
      ${anchorId === "-1" ? pg`` : type === "newer" ? pg`AND id>${anchorId}` : pg`AND id<${anchorId}`}
      ORDER BY id ${anchorId === "-1" ? pg`DESC` : type === "newer" ? pg`ASC` : pg`DESC`}
      LIMIT 20
    `;

    const res: IUserParsed[] = [];
    result.forEach(argument => {
      const parsed = iUserSchema.safeParse(argument);
      if (parsed.success) res.push(parsed.data);
    })

    return { data: res };
  }
)

const getUserFollowing = sage.resource(
  {} as SchemaContext,
  {} as z.infer<typeof getUserFollowingSchema>,
  async (arg, ctx): Promise<{ data?: IUser[], error?: ErrorCode }> => {
    const parsed = getUserFollowingSchema.safeParse(arg);
    if (!parsed.success) return { error: ErrorCode.Default };

    const info = await auth.getAuthInfo(ctx);
    if (!info) return { error: ErrorCode.Default };

    const { anchorId, type } = parsed.data;
    const userId = parsed.data.userId ?? ctx.userId;
    if (!userId) return { error: ErrorCode.Default };

    const result = await pg<IUserRaw[]>`
      SELECT id, name, username, bio, join_date, follower_count, following_count FROM users
      WHERE id IN (SELECT following_id FROM user_follows WHERE follower_id=${userId})
      ${anchorId === "-1" ? pg`` : type === "newer" ? pg`AND id>${anchorId}` : pg`AND id<${anchorId}`}
      ORDER BY id ${anchorId === "-1" ? pg`DESC` : type === "newer" ? pg`ASC` : pg`DESC`}
      LIMIT 20
    `;

    const res: IUserParsed[] = [];
    result.forEach(argument => {
      const parsed = iUserSchema.safeParse(argument);
      if (parsed.success) res.push(parsed.data);
    })

    return { data: res };
  }
)

export default {
  getUser,
  editUser,
  searchUser,

  getUserDiscussions,

  followUser,
  getUserFollowers,
  getUserFollowing,
}