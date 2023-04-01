import { SchemaContext } from "./_schema";
import sage from "@dorkodu/sage-server";
import { ErrorCode } from "../types/error_codes";
import auth from "./auth";
import { createArgumentSchema, createCommentSchema, createDiscussionSchema, deleteArgumentSchema, deleteCommentSchema, deleteDiscussionSchema, editDiscussionSchema, favouriteDiscussionSchema, getArgumentSchema, getArgumentsSchema, getCommentSchema, getCommentsSchema, getDiscussionSchema, getFavouriteDiscussionFeedSchema, getGuestDiscussionFeedSchema, getUserDiscussionFeedSchema, voteArgumentSchema } from "../schemas/discussion";
import pg from "../pg";
import { snowflake } from "../lib/snowflake";
import { date } from "../lib/date";
import { z } from "zod";
import { IDiscussion, IDiscussionParsed, IDiscussionRaw, iDiscussionSchema } from "../types/discussion";
import { IComment, ICommentParsed, ICommentRaw, iCommentSchema } from "../types/comment";
import { IArgument, IArgumentParsed, IArgumentRaw, iArgumentSchema } from "../types/argument";
import user from "./user";

const createDiscussion = sage.resource(
  {} as SchemaContext,
  {} as z.infer<typeof createDiscussionSchema>,
  async (arg, ctx): Promise<{ data?: IDiscussion, error?: ErrorCode }> => {
    const parsed = createDiscussionSchema.safeParse(arg);
    if (!parsed.success) return { error: ErrorCode.Default };

    const info = await auth.getAuthInfo(ctx);
    if (!info) return { error: ErrorCode.Default };

    const { title, readme } = parsed.data;

    const row = {
      id: snowflake.id("discussions"),
      userId: info.userId,
      date: date.utc(),
      title: title,
      titleCi: title.toLowerCase(),
      readme: readme,
      favouriteCount: 0,
      argumentCount: 0,
      commentCount: 0,
      lastUpdateDate: -1,
    }

    const result = await pg`INSERT INTO discussions ${pg(row)}`;
    if (result.count === 0) return { error: ErrorCode.Default };

    return { data: { ...row, favourited: false } };
  }
)

const deleteDiscussion = sage.resource(
  {} as SchemaContext,
  {} as z.infer<typeof deleteDiscussionSchema>,
  async (arg, ctx): Promise<{ data?: {}, error?: ErrorCode }> => {
    const parsed = deleteDiscussionSchema.safeParse(arg);
    if (!parsed.success) return { error: ErrorCode.Default };

    const info = await auth.getAuthInfo(ctx);
    if (!info) return { error: ErrorCode.Default };

    const { discussionId } = parsed.data;

    const [res0] = await pg.begin(pg => [
      pg`DELETE FROM discussions WHERE id=${discussionId} AND user_id=${info.userId}`,
      pg`DELETE FROM discussion_favourites WHERE discussion_id=${discussionId}`,
      pg`DELETE FROM discussion_comments WHERE discussion_id=${discussionId}`,
      pg`DELETE FROM discussion_arguments WHERE discussion_id=${discussionId}`,
      pg`DELETE FROM argument_votes WHERE discussion_id=${discussionId}`,
    ]);
    if (res0.count === 0) return { error: ErrorCode.Default };

    return { data: {} };
  }
)

const getDiscussion = sage.resource(
  {} as SchemaContext,
  {} as z.infer<typeof getDiscussionSchema>,
  async (arg, ctx): Promise<{ data?: IDiscussion, error?: ErrorCode }> => {
    const parsed = getDiscussionSchema.safeParse(arg);
    if (!parsed.success) return { error: ErrorCode.Default };

    const info = await auth.getAuthInfo(ctx);

    const { discussionId } = parsed.data;

    const result = await pg.begin(async (pg) => {
      const [result0]: [IDiscussionRaw?] = await pg`
        SELECT
          d.id, d.user_id, d.date, d.title, d.readme,
          d.favourite_count, d.argument_count, d.comment_count,
          d.last_update_date,
        ${info ?
          pg`(EXISTS (SELECT * FROM discussion_favourites df WHERE df.discussion_id=d.id AND df.user_id=${info.userId})) AS favourited` :
          pg`FALSE AS favourited`
        }
        FROM discussions d
        WHERE d.id=${discussionId}
      `;
      if (!result0) return undefined;

      // If current user is blocked by the discussion owner
      if (info) {
        const [result1]: [{ exists: boolean }?] = await pg`
          SELECT EXISTS (
            SELECT * FROM user_blocks
            WHERE blocker_id=${result0.userId} AND blocking_id=${info.userId}
          )
        `;
        if (!result1) return undefined;
        if (result1.exists) return undefined;
      }

      const res = iDiscussionSchema.safeParse(result0);
      if (!res.success) return undefined;

      if (ctx.userIds === undefined) ctx.userIds = new Set([res.data.userId]);
      else ctx.userIds.add(res.data.userId);

      return res.data;
    });

    if (!result) return { error: ErrorCode.Default };
    return { data: result };
  }
)

const editDiscussion = sage.resource(
  {} as SchemaContext,
  {} as z.infer<typeof editDiscussionSchema>,
  async (arg, ctx): Promise<{ data?: {}, error?: ErrorCode }> => {
    const parsed = editDiscussionSchema.safeParse(arg);
    if (!parsed.success) return { error: ErrorCode.Default };

    const info = await auth.getAuthInfo(ctx);
    if (!info) return { error: ErrorCode.Default };

    const { discussionId, title, readme } = parsed.data;

    const result = await pg`
      UPDATE discussions
      SET title=${title}, title_ci=${title.toLowerCase()}, readme=${readme}, last_update_date=${date.utc()}
      WHERE id=${discussionId} AND user_id=${info.userId}
    `;
    if (result.count === 0) return { error: ErrorCode.Default };

    return { data: {} };
  }
)

const searchDiscussion = sage.resource(
  {} as SchemaContext,
  undefined,
  async (_arg, _ctx): Promise<{ data?: {}, error?: ErrorCode }> => {
    return { data: {} };
  }
)


const getUserDiscussionFeed = sage.resource(
  {} as SchemaContext,
  {} as z.infer<typeof getUserDiscussionFeedSchema>,
  async (arg, ctx): Promise<{ data?: IDiscussion[], error?: ErrorCode }> => {
    const parsed = getUserDiscussionFeedSchema.safeParse(arg);
    if (!parsed.success) return { error: ErrorCode.Default };

    const info = await auth.getAuthInfo(ctx);
    if (!info) return { error: ErrorCode.Default };

    const { anchorId, type } = parsed.data;

    const result = await pg`
      SELECT 
        d.id, d.user_id, d.date, d.title,
        d.favourite_count, d.argument_count, d.comment_count,
        d.last_update_date,
        (EXISTS (SELECT * FROM discussion_favourites df WHERE df.discussion_id=d.id AND df.user_id=${info.userId})) AS favourited
      FROM discussions d
      INNER JOIN user_follows uf
      ON d.user_id=uf.following_id AND uf.follower_id=${info.userId}
      ${anchorId === "-1" ? pg`` :
        type === "newer" ? pg`WHERE d.id<${anchorId}` : pg`WHERE d.id>${anchorId}`}
      ORDER BY d.id ${type === "newer" ? pg`DESC` : pg`ASC`}
      LIMIT 20
    `;

    const res: IDiscussionParsed[] = [];
    result.forEach(user => {
      const parsed = iDiscussionSchema.safeParse(user);
      if (parsed.success) res.push(parsed.data);
    });

    if (ctx.userIds === undefined) ctx.userIds = new Set();
    res.forEach((discussion) => { ctx.userIds?.add(discussion.userId) });

    return { data: res };
  }
)

const getFavouriteDiscussionFeed = sage.resource(
  {} as SchemaContext,
  {} as z.infer<typeof getFavouriteDiscussionFeedSchema>,
  async (arg, ctx): Promise<{ data?: IDiscussion[], error?: ErrorCode }> => {
    const parsed = getFavouriteDiscussionFeedSchema.safeParse(arg);
    if (!parsed.success) return { error: ErrorCode.Default };

    const info = await auth.getAuthInfo(ctx);
    if (!info) return { error: ErrorCode.Default };

    const { anchorId, type } = parsed.data;

    const result = await pg`
      SELECT 
        d.id, d.user_id, d.date, d.title,
        d.favourite_count, d.argument_count, d.comment_count,
        d.last_update_date,
        (df.user_id IS NOT NULL) AS favourited
      FROM discussions d
      INNER JOIN discussion_favourites df
      ON d.id=df.discussion_id AND df.user_id=${info.userId}
      ${anchorId === "-1" ? pg`` :
        type === "newer" ? pg`WHERE d.id<${anchorId}` : pg`WHERE d.id>${anchorId}`}
      ${info ?
        pg`
          ${anchorId === "-1" ? pg`WHERE` : pg`AND`} (
            NOT EXISTS (
              SELECT * FROM user_blocks ub
              WHERE 
                (ub.blocker_id=${info.userId} AND d.user_id=ub.blocking_id) OR
                (ub.blocking_id=${info.userId} AND d.user_id=ub.blocker_id)
            )
          )
        ` : pg``}
      ORDER BY d.id ${type === "newer" ? pg`DESC` : pg`ASC`}
      LIMIT 20
    `;

    const res: IDiscussionParsed[] = [];
    result.forEach(user => {
      const parsed = iDiscussionSchema.safeParse(user);
      if (parsed.success) res.push(parsed.data);
    });

    if (ctx.userIds === undefined) ctx.userIds = new Set();
    res.forEach((discussion) => { ctx.userIds?.add(discussion.userId) });

    return { data: res };
  }
)

const getGuestDiscussionFeed = sage.resource(
  {} as SchemaContext,
  {} as z.infer<typeof getGuestDiscussionFeedSchema>,
  async (arg, ctx): Promise<{ data?: IDiscussion[], error?: ErrorCode }> => {
    const parsed = getGuestDiscussionFeedSchema.safeParse(arg);
    if (!parsed.success) return { error: ErrorCode.Default };

    const info = await auth.getAuthInfo(ctx);

    const { anchorId, type } = parsed.data;

    const result = await pg`
      SELECT 
        d.id, d.user_id, d.date, d.title,
        d.favourite_count, d.argument_count, d.comment_count,
        d.last_update_date,
      ${info ?
        pg`(EXISTS (SELECT * FROM discussion_favourites df WHERE df.discussion_id=d.id AND df.user_id=${info.userId})) AS favourited` :
        pg`FALSE AS favourited`
      }
      FROM discussions d
      ${anchorId === "-1" ? pg`` :
        type === "newer" ? pg`WHERE d.id<${anchorId}` : pg`WHERE d.id>${anchorId}`}
      ${info ?
        pg`
          ${anchorId === "-1" ? pg`WHERE` : pg`AND`} (
            NOT EXISTS (
              SELECT * FROM user_blocks ub
              WHERE 
                (ub.blocker_id=${info.userId} AND d.user_id=ub.blocking_id) OR
                (ub.blocking_id=${info.userId} AND d.user_id=ub.blocker_id)
            )
          )
        ` : pg``}
      ORDER BY d.id ${type === "newer" ? pg`DESC` : pg`ASC`}
      LIMIT 20
    `;

    const res: IDiscussionParsed[] = [];
    result.forEach(user => {
      const parsed = iDiscussionSchema.safeParse(user);
      if (parsed.success) res.push(parsed.data);
    });

    if (ctx.userIds === undefined) ctx.userIds = new Set();
    res.forEach((discussion) => { ctx.userIds?.add(discussion.userId) })

    return { data: res };
  }
)


const favouriteDiscussion = sage.resource(
  {} as SchemaContext,
  {} as z.infer<typeof favouriteDiscussionSchema>,
  async (arg, ctx): Promise<{ data?: {}, error?: ErrorCode }> => {
    const parsed = favouriteDiscussionSchema.safeParse(arg);
    if (!parsed.success) return { error: ErrorCode.Default };

    const info = await auth.getAuthInfo(ctx);
    if (!info) return { error: ErrorCode.Default };

    const { discussionId, favourited } = parsed.data;

    const result = await pg.begin(async (pg) => {
      // If current user is blocked by the discussion owner
      const [result0]: [{ exists: boolean }?] = await pg`
        SELECT EXISTS (
          SELECT * FROM user_blocks
          WHERE
            blocker_id IN (SELECT user_id FROM discussions WHERE id=${discussionId})
            AND
            blocking_id=${info.userId}
        )
      `;
      if (!result0) return false;
      if (result0.exists) return false;

      if (favourited) {
        const row = {
          id: snowflake.id("discussion_favourites"),
          userId: info.userId,
          discussionId: discussionId,
        }

        const [result1, result2, result3] = await Promise.all([
          pg`INSERT INTO discussion_favourites ${pg(row)}`,
          pg`UPDATE discussions SET favourite_count=favourite_count+1 WHERE id=${discussionId}`,
          pg`SELECT user_id FROM discussions WHERE id=${discussionId}`,
        ]);
        if (result1.count === 0) return false;
        if (result2.count === 0) return false;
        // No need to check if user exists, user might have deleted their account but not the discussions

        // Get the discussion's owner id, which is needed to create notification
        const discussionOwnerId: string | undefined = result3[0]?.userId;

        // Once discussion is successfully favourited, try to create a notification
        if (discussionOwnerId) {
          user.queryCreateNotification(
            discussionOwnerId,
            row.userId,
            row.discussionId,
            null,
            "discussionFavourite",
          );
        }
      }
      else {
        const [result1, result2] = await Promise.all([
          pg`DELETE FROM discussion_favourites WHERE user_id=${info.userId} AND discussion_id=${discussionId}`,
          pg`UPDATE discussions SET favourite_count=favourite_count-1 WHERE id=${discussionId}`,
        ]);
        if (result1.count === 0) return false;
        if (result2.count === 0) return false;
      }

      return true;
    });

    if (!result) return { error: ErrorCode.Default };
    return { data: {} };
  }
)

const createArgument = sage.resource(
  {} as SchemaContext,
  {} as z.infer<typeof createArgumentSchema>,
  async (arg, ctx): Promise<{ data?: IArgument, error?: ErrorCode }> => {
    const parsed = createArgumentSchema.safeParse(arg);
    if (!parsed.success) return { error: ErrorCode.Default };

    const info = await auth.getAuthInfo(ctx);
    if (!info) return { error: ErrorCode.Default };

    const { discussionId, content, type } = parsed.data;

    const result = await pg.begin(async (pg) => {
      // If current user is blocked by the discussion owner
      const [result0]: [{ exists: boolean }?] = await pg`
        SELECT EXISTS (
          SELECT * FROM user_blocks
          WHERE
            blocker_id IN (SELECT user_id FROM discussions WHERE id=${discussionId})
            AND
            blocking_id=${info.userId}
        )
      `;
      if (!result0) return undefined;
      if (result0.exists) return undefined;

      const row = {
        id: snowflake.id("discussion_arguments"),
        userId: info.userId,
        discussionId: discussionId,
        date: date.utc(),
        content: content,
        type: type,
        voteCount: 0,
      }

      const [result1, result2, result3] = await Promise.all([
        pg`INSERT INTO discussion_arguments ${pg(row)}`,
        pg`UPDATE discussions SET last_update_date=${date.utc()}, argument_count=argument_count+1 WHERE id=${discussionId}`,
        pg`SELECT user_id FROM discussions WHERE id=${discussionId}`
      ]);
      if (result1.count === 0) return undefined;
      if (result2.count === 0) return undefined;

      // Get the discussion's owner id, which is needed to create notification
      const discussionOwnerId: string | undefined = result3[0]?.userId;

      // Once argument is successfully created, try to create a notification
      if (discussionOwnerId) {
        user.queryCreateNotification(
          discussionOwnerId,
          row.userId,
          row.discussionId,
          row.id,
          "discussionArgument",
        );
      }

      return row;
    });

    if (!result) return { error: ErrorCode.Default };
    return { data: { ...result, voted: false, votedType: true } };
  }
)

const deleteArgument = sage.resource(
  {} as SchemaContext,
  {} as z.infer<typeof deleteArgumentSchema>,
  async (arg, ctx): Promise<{ data?: {}, error?: ErrorCode }> => {
    const parsed = deleteArgumentSchema.safeParse(arg);
    if (!parsed.success) return { error: ErrorCode.Default };

    const info = await auth.getAuthInfo(ctx);
    if (!info) return { error: ErrorCode.Default };

    const { argumentId } = parsed.data;

    const result = await pg.begin(async (pg) => {
      // Get discussion id from argument id
      const [result0]: [{ discussionId: string }?] = await pg`
        SELECT discussion_id FROM discussion_arguments WHERE id=${argumentId}
      `;
      if (!result0) return false;

      // If current user is blocked by the discussion owner
      const [result1]: [{ exists: boolean }?] = await pg`
        SELECT EXISTS (
          SELECT * FROM user_blocks
          WHERE
            blocker_id IN (SELECT user_id FROM discussions WHERE id=${result0.discussionId})
            AND
            blocking_id=${info.userId}
        )
      `;
      if (!result1) return false;
      if (result1.exists) return false;

      // Reduce argument count, delete argument and delete argument votes (don't delete notifications)
      const [result2, result3, _result4] = await Promise.all([
        pg`UPDATE discussions SET argument_count=argument_count-1 WHERE id=${result0.discussionId}`,
        pg`DELETE FROM discussion_arguments WHERE id=${argumentId} AND user_id=${info.userId}`,
        pg`DELETE FROM argument_votes WHERE argument_id=${argumentId}`,
      ]);
      if (result2.count === 0) return false;
      if (result3.count === 0) return false;

      return true;
    });

    if (!result) return { error: ErrorCode.Default };
    return { data: {} };
  }
)

const getArguments = sage.resource(
  {} as SchemaContext,
  {} as z.infer<typeof getArgumentsSchema>,
  async (arg, ctx): Promise<{ data?: IArgument[], error?: ErrorCode }> => {
    const parsed = getArgumentsSchema.safeParse(arg);
    if (!parsed.success) return { error: ErrorCode.Default };

    const info = await auth.getAuthInfo(ctx);

    const { discussionId, anchorId, type } = parsed.data;

    const result0 = await pg`
      SELECT 
        da.id, da.user_id, da.discussion_id, 
        da.date, da.content, da.type, da.vote_count,
      ${info ?
        pg`
        (av.user_id IS NOT NULL) AS voted, 
        av.type AS voted_type` :
        pg`FALSE AS voted, null AS voted_type`
      }
      FROM discussion_arguments da
      ${info ?
        pg`
        LEFT JOIN argument_votes av
        ON da.id=av.argument_id AND av.user_id=${info.userId}` :
        pg``
      }
      WHERE da.discussion_id=${discussionId}
      ${type === "newer" || type === "older" ?
        anchorId === "-1" ? pg`` : type === "newer" ? pg`AND da.id<${anchorId}` : pg`AND da.id>${anchorId}` :
        pg``
      }
      ${info ?
        pg`
          AND (
            NOT EXISTS (
              SELECT * FROM user_blocks ub
              WHERE 
                (ub.blocker_id=${info.userId} AND da.user_id=ub.blocking_id) OR
                (ub.blocking_id=${info.userId} AND da.user_id=ub.blocker_id)
            )
          )
        ` : pg``}
      ${type === "newer" || type === "older" ?
        pg`ORDER BY da.id ${type === "newer" ? pg`DESC` : pg`ASC`}` :
        pg`ORDER BY da.vote_count ${type === "top" ? pg`DESC` : pg`ASC`}`
      }
      LIMIT 20
    `;

    const res: IArgumentParsed[] = [];
    result0.forEach(argument => {
      const parsed = iArgumentSchema.safeParse(argument);
      if (parsed.success) res.push(parsed.data);
    })

    if (ctx.userIds === undefined) ctx.userIds = new Set();
    res.forEach((argument) => { ctx.userIds?.add(argument.userId) })

    return { data: res };
  }
)

const getArgument = sage.resource(
  {} as SchemaContext,
  {} as z.infer<typeof getArgumentSchema>,
  async (arg, ctx): Promise<{ data?: IArgument, error?: ErrorCode }> => {
    const parsed = getArgumentSchema.safeParse(arg);
    if (!parsed.success) return { error: ErrorCode.Default };

    const info = await auth.getAuthInfo(ctx);

    const { argumentId } = parsed.data;

    const result = await pg.begin(async (pg) => {
      // If user is logged in, check blocked status by the discussion owner
      if (info) {
        const [result0]: [{ exists: boolean }?] = await pg`
          SELECT EXISTS (
            SELECT * FROM user_blocks
            WHERE
              blocker_id IN (SELECT user_id FROM discussion_arguments WHERE id=${argumentId})
              AND
              blocking_id=${info.userId}
          )
        `;
        if (!result0) return undefined;
        if (result0.exists) return undefined;
      }

      const [result1]: [IArgumentRaw?] = await pg`
        SELECT 
          da.id, da.user_id, da.discussion_id, 
          da.date, da.content, da.type, da.vote_count,
        ${info ?
          pg`
          (av.user_id IS NOT NULL) AS voted, 
          av.type AS voted_type` :
          pg`FALSE AS voted, null AS voted_type`
        }
        FROM discussion_arguments da
        ${info ?
          pg`
          LEFT JOIN argument_votes av
          ON da.id=av.argument_id AND av.user_id=${info.userId}` :
          pg``
        }
        WHERE da.id=${argumentId}
    ` ;
      if (!result1) return undefined;

      const res = iArgumentSchema.safeParse(result1);

      if (res.success) {
        if (ctx.userIds === undefined) ctx.userIds = new Set();
        ctx.userIds?.add(res.data.userId);

        return res.data;
      }

      return undefined;
    });

    if (!result) return { error: ErrorCode.Default };
    return { data: result };
  }
)

const voteArgument = sage.resource(
  {} as SchemaContext,
  {} as z.infer<typeof voteArgumentSchema>,
  async (arg, ctx): Promise<{ data?: {}, error?: ErrorCode }> => {
    const parsed = voteArgumentSchema.safeParse(arg);
    if (!parsed.success) return { error: ErrorCode.Default };

    const info = await auth.getAuthInfo(ctx);
    if (!info) return { error: ErrorCode.Default };

    const { argumentId, type } = parsed.data;

    const result = await pg.begin(async (pg) => {
      // Get discussion id using argument id
      const [result0]: [{ discussionId: string }?] = await pg`
        SELECT discussion_id FROM discussion_arguments WHERE id=${argumentId}
      `;
      if (!result0) return false;

      // If current user is blocked by the discussion owner
      const [result1]: [{ exists: boolean }?] = await pg`
        SELECT EXISTS (
          SELECT * FROM user_blocks
          WHERE
            blocker_id IN (SELECT user_id FROM discussions WHERE id=${result0.discussionId})
            AND
            blocking_id=${info.userId}
        )
      `;
      if (!result1) return false;
      if (result1.exists) return false;

      if (type === "none") {
        const [result2]: [{ type: boolean }?] = await pg`
          DELETE FROM argument_votes 
          WHERE user_id=${info.userId} AND argument_id=${argumentId}
          RETURNING type
        `;
        if (!result2) return false;

        const voted = result2.type;
        let count = voted ? -1 : +1;

        const result3 = await pg`
          UPDATE discussion_arguments SET vote_count=vote_count+${count}
          WHERE id=${argumentId}
        `;
        if (result3.count === 0) return false;
      }
      else {
        const [result2]: [{ discussionId: string }?] = await pg`
          SELECT discussion_id FROM discussion_arguments 
          WHERE id=${argumentId}
        `;
        if (!result2) return false;

        const row = {
          id: snowflake.id("argument_votes"),
          userId: info.userId,
          argumentId: argumentId,
          discussionId: result2.discussionId,
          type: type === "up",
        }

        const [result3]: [{ type: boolean }?] = await pg`
          SELECT type FROM argument_votes 
          WHERE user_id=${info.userId} AND argument_id=${argumentId}
        `;

        const voted = result3?.type;
        let count: number;
        if (voted === true && type === "down") count = -2;
        else if (voted === false && type === "up") count = +2;
        else if (voted === undefined && type === "up") count = +1;
        else if (voted === undefined && type === "down") count = -1;
        else return false;

        const [result4, result5, result6] = await Promise.all([
          (voted === undefined ?
            pg`INSERT INTO argument_votes ${pg(row)}` :
            pg`UPDATE argument_votes SET type=${row.type} WHERE user_id=${info.userId} AND argument_id=${argumentId}`
          ),
          pg`UPDATE discussion_arguments SET vote_count=vote_count+${count} WHERE id=${argumentId}`,
          pg`SELECT user_id FROM discussions WHERE id=${result2.discussionId}`,
        ]);
        if (result4.count === 0) return false;
        if (result5.count === 0) return false;

        // Get the discussion's owner id, which is needed to create notification
        const discussionOwnerId: string | undefined = result6[0]?.userId;

        // Once discussion is successfully favourited, try to create a notification
        if (discussionOwnerId) {
          user.queryCreateNotification(
            discussionOwnerId,
            row.userId,
            row.discussionId,
            row.argumentId,
            "argumentVote",
          );
        }
      }

      return true;
    });

    if (!result) return { error: ErrorCode.Default };
    return { data: {} };
  }
)


const createComment = sage.resource(
  {} as SchemaContext,
  {} as z.infer<typeof createCommentSchema>,
  async (arg, ctx): Promise<{ data?: IComment, error?: ErrorCode }> => {
    const parsed = createCommentSchema.safeParse(arg);
    if (!parsed.success) return { error: ErrorCode.Default };

    const info = await auth.getAuthInfo(ctx);
    if (!info) return { error: ErrorCode.Default };

    const { discussionId, content } = parsed.data;

    const result = await pg.begin(async (pg) => {
      // If current user is blocked by the discussion owner
      const [result0]: [{ exists: boolean }?] = await pg`
        SELECT EXISTS (
          SELECT * FROM user_blocks
          WHERE
            blocker_id IN (SELECT user_id FROM discussions WHERE id=${discussionId})
            AND
            blocking_id=${info.userId}
        )
      `;
      if (!result0) return undefined;
      if (result0.exists) return undefined;

      const row = {
        id: snowflake.id("discussion_comments"),
        userId: info.userId,
        discussionId: discussionId,
        date: date.utc(),
        content: content,
      }

      const [result1, result2, result3] = await Promise.all([
        pg`INSERT INTO discussion_comments ${pg(row)}`,
        pg`UPDATE discussions SET last_update_date=${date.utc()}, comment_count=comment_count+1 WHERE id=${discussionId}`,
        pg`SELECT user_id FROM discussions WHERE id=${discussionId}`
      ]);
      if (result1.count === 0) return undefined;
      if (result2.count === 0) return undefined;

      // Get the discussion's owner id, which is needed to create notification
      const discussionOwnerId: string | undefined = result3[0]?.userId;

      // Once comment is successfully created, try to create a notification
      if (discussionOwnerId) {
        user.queryCreateNotification(
          discussionOwnerId,
          row.userId,
          row.discussionId,
          row.id,
          "discussionComment",
        );
      }

      return row;
    });

    if (!result) return { error: ErrorCode.Default };
    return { data: result };
  }
)

const deleteComment = sage.resource(
  {} as SchemaContext,
  {} as z.infer<typeof deleteCommentSchema>,
  async (arg, ctx): Promise<{ data?: {}, error?: ErrorCode }> => {
    const parsed = deleteCommentSchema.safeParse(arg);
    if (!parsed.success) return { error: ErrorCode.Default };

    const info = await auth.getAuthInfo(ctx);
    if (!info) return { error: ErrorCode.Default };

    const { commentId } = parsed.data;

    const result = await pg.begin(async (pg) => {
      const [result0]: [{ discussionId: string }?] = await pg`
        SELECT discussion_id FROM discussion_comments WHERE id=${commentId}
      `;
      if (!result0) return false;

      // If current user is blocked by the discussion owner
      const [result1]: [{ exists: boolean }?] = await pg`
        SELECT EXISTS (
          SELECT * FROM user_blocks
          WHERE
            blocker_id IN (SELECT user_id FROM discussions WHERE id=${result0.discussionId})
            AND
            blocking_id=${info.userId}
        )
      `;
      if (!result1) return false;
      if (result1.exists) return false;

      const [result2, result3] = await Promise.all([
        pg`UPDATE discussions SET comment_count=comment_count-1 WHERE id=${result0.discussionId}`,
        pg`DELETE FROM discussion_comments WHERE id=${commentId} AND user_id=${info.userId}`,
      ]);
      if (result2.count === 0) return false;
      if (result3.count === 0) return false;

      return true;
    });

    if (!result) return { error: ErrorCode.Default };
    return { data: {} };
  }
)

const getComments = sage.resource(
  {} as SchemaContext,
  {} as z.infer<typeof getCommentsSchema>,
  async (arg, ctx): Promise<{ data?: IComment[], error?: ErrorCode }> => {
    const parsed = getCommentsSchema.safeParse(arg);
    if (!parsed.success) return { error: ErrorCode.Default };

    const info = await auth.getAuthInfo(ctx);

    const { discussionId, anchorId, type } = parsed.data;

    const result0 = await pg<ICommentRaw[]>`
      SELECT id, user_id, discussion_id, date, content FROM discussion_comments dc
      WHERE dc.discussion_id=${discussionId}
      ${anchorId === "-1" ? pg`` : type === "newer" ? pg`AND dc.id<${anchorId}` : pg`AND dc.id>${anchorId}`}
      ${info ?
        pg`
          AND (
            NOT EXISTS (
              SELECT * FROM user_blocks ub
              WHERE 
                (ub.blocker_id=${info.userId} AND dc.user_id=ub.blocking_id) OR
                (ub.blocking_id=${info.userId} AND dc.user_id=ub.blocker_id)
            )
          )
        ` : pg``}
      ORDER BY dc.id ${type === "newer" ? pg`DESC` : pg`ASC`}
      LIMIT 20
    `;

    const res: ICommentParsed[] = [];
    result0.forEach(comment => {
      const parsed = iCommentSchema.safeParse(comment);
      if (parsed.success) res.push(parsed.data);
    })

    if (ctx.userIds === undefined) ctx.userIds = new Set();
    res.forEach((comment) => { ctx.userIds?.add(comment.userId) })

    return { data: res };
  }
)

const getComment = sage.resource(
  {} as SchemaContext,
  {} as z.infer<typeof getCommentSchema>,
  async (arg, ctx): Promise<{ data?: IComment, error?: ErrorCode }> => {
    const parsed = getCommentSchema.safeParse(arg);
    if (!parsed.success) return { error: ErrorCode.Default };

    const info = await auth.getAuthInfo(ctx);

    const { commentId } = parsed.data;

    const result = await pg.begin(async (pg) => {
      if (info) {
        // If current user is blocked by the discussion owner
        const [result0]: [{ exists: boolean }?] = await pg`
        SELECT EXISTS (
          SELECT * FROM user_blocks
          WHERE
            blocker_id IN (SELECT user_id FROM discussion_comments WHERE id=${commentId})
            AND
            blocking_id=${info.userId}
        )
        `;
        if (!result0) return undefined;
        if (result0.exists) return undefined;
      }

      const [result1]: [ICommentRaw?] = await pg`
        SELECT id, user_id, discussion_id, date, content FROM discussion_comments dc
        WHERE dc.id=${commentId}
      `;

      const res = iCommentSchema.safeParse(result1);

      if (res.success) {
        if (ctx.userIds === undefined) ctx.userIds = new Set();
        ctx.userIds?.add(res.data.userId);

        return res.data;
      }

      return undefined;
    });

    if (!result) return { error: ErrorCode.Default };
    return { data: result };
  }
)

export default {
  createDiscussion,
  deleteDiscussion,
  getDiscussion,
  editDiscussion,
  searchDiscussion,

  favouriteDiscussion,

  getUserDiscussionFeed,
  getFavouriteDiscussionFeed,
  getGuestDiscussionFeed,

  createArgument,
  deleteArgument,
  getArguments,
  getArgument,
  voteArgument,

  createComment,
  deleteComment,
  getComments,
  getComment,
}