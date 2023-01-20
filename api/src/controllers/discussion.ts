import { SchemaContext } from "./_schema";
import sage from "@dorkodu/sage-server";
import { ErrorCode } from "../types/error_codes";
import auth from "./auth";
import { createArgumentSchema, createCommentSchema, createDiscussionSchema, deleteArgumentSchema, deleteCommentSchema, deleteDiscussionSchema, editDiscussionSchema, getArgumentsSchema, getCommentsSchema, getDiscussionSchema } from "../schemas/discussion";
import pg from "../pg";
import { snowflake } from "../lib/snowflake";
import { date } from "../lib/date";
import { z } from "zod";
import { IDiscussion, IDiscussionRaw, iDiscussionSchema } from "../types/discussion";
import { IComment, ICommentParsed, ICommentRaw, iCommentSchema } from "../types/comment";
import { IArgument, IArgumentParsed, IArgumentRaw, iArgumentSchema } from "../types/argument";
import postgres from "postgres";

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
      readme: readme,
      favouriteCount: 0,
      argumentCount: 0,
      commentCount: 0,
      lastUpdateDate: -1,
      lastArgumentDate: -1,
      lastCommentDate: -1,
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

    const result = await pg`
      DELETE FROM discussions
      WHERE id=${discussionId} AND user_id=${info.userId}
    `;
    if (result.count === 0) return { error: ErrorCode.Default };

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
    if (!info) return { error: ErrorCode.Default };

    const { discussionId } = parsed.data;

    const [result]: [IDiscussionRaw?] = await pg`
      SELECT 
        d.id, d.user_id, d.date, d.title, d.readme, 
        d.favourite_count, d.argument_count, d.comment_count,
        d.last_update_date, d.last_argument_date, d.last_comment_date,
        (df.user_id IS NOT NULL) AS favourited
      FROM discussions d
      LEFT JOIN discussion_favourites df
      ON d.id=df.discussion_id AND df.user_id=${info.userId}
      WHERE d.id=${discussionId}
    `;
    const res = iDiscussionSchema.safeParse(result);
    if (!res.success) return { error: ErrorCode.Default };

    if (ctx.userIds === undefined) ctx.userIds = new Set([res.data.userId]);
    else ctx.userIds.add(res.data.userId);

    return { data: res.data };
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
      UPDATE discussions SET title=${title}, readme=${readme}, last_update_date=${date.utc()}
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
  undefined,
  async (_arg, _ctx): Promise<{ data?: {}, error?: ErrorCode }> => {
    return { data: {} };
  }
)

const getGuestDiscussionFeed = sage.resource(
  {} as SchemaContext,
  undefined,
  async (_arg, _ctx): Promise<{ data?: {}, error?: ErrorCode }> => {
    return { data: {} };
  }
)

const favouriteDiscussion = sage.resource(
  {} as SchemaContext,
  undefined,
  async (_arg, _ctx): Promise<{ data?: {}, error?: ErrorCode }> => {
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

    const row = {
      id: snowflake.id("discussion_arguments"),
      userId: info.userId,
      discussionId: discussionId,
      date: date.utc(),
      content: content,
      type: type,
      voteCount: 0,
    }

    const [result0, result1] = await pg.begin(pg => [
      pg`INSERT INTO discussion_arguments ${pg(row)}`,
      pg`UPDATE discussions SET last_argument_date=${date.utc()} WHERE id=${discussionId}`,
    ]);
    if (result0.count === 0) return { error: ErrorCode.Default };
    if (result1.count === 0) return { error: ErrorCode.Default };

    return { data: { ...row, voted: false, votedType: true } };
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

    const [result0, _result1] = await pg.begin(pg => [
      pg`DELETE FROM discussion_arguments WHERE id=${argumentId} AND user_id=${info.userId}`,
      pg`DELETE FROM argument_votes WHERE argument_id=${argumentId}`,
    ]);
    if (result0.count === 0) return { error: ErrorCode.Default };

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
    if (!info) return { error: ErrorCode.Default };

    const { discussionId, anchorId, type } = parsed.data;

    let result: postgres.RowList<IArgumentRaw[]>;

    if (type === "newer" || type === "older") {
      result = await pg<IArgumentRaw[]>`
        SELECT 
          da.id, da.user_id, da.discussion_id, 
          da.date, da.content, da.type, da.vote_count,
          (av.user_id IS NOT NULL) AS voted, 
          av.type AS voted_type
        FROM discussion_arguments da
        LEFT JOIN argument_votes av
        ON da.id=av.argument_id AND da.user_id=${info.userId}
        WHERE da.discussion_id=${discussionId}
        ${anchorId === "-1" ? pg`` : type === "newer" ? pg`AND da.id>${anchorId}` : pg`AND da.id<${anchorId}`}
        ORDER BY da.id ${anchorId === "-1" ? pg`DESC` : type === "newer" ? pg`ASC` : pg`DESC`}
        LIMIT 20
      `;
    }
    else {
      result = await pg<IArgumentRaw[]>`
        SELECT 
          da.id, da.user_id, da.discussion_id, 
          da.date, da.content, da.type, da.vote_count,
          (av.user_id IS NOT NULL) AS voted, 
          av.type AS voted_type
        FROM discussion_arguments da
        LEFT JOIN argument_votes av
        ON da.id=av.argument_id AND da.user_id=${info.userId}
        WHERE discussion_id=${discussionId}
        ORDER BY da.vote_count ${type === "top" ? pg`DESC` : pg`ASC`}
        LIMIT 20
      `;
    }

    const res: IArgumentParsed[] = [];
    result.forEach(argument => {
      const parsed = iArgumentSchema.safeParse(argument);
      if (parsed.success) res.push(parsed.data);
    })

    if (ctx.userIds === undefined) ctx.userIds = new Set();
    res.forEach((argument) => { ctx.userIds?.add(argument.userId) })

    return { data: res };
  }
)

const voteArgument = sage.resource(
  {} as SchemaContext,
  undefined,
  async (_arg, _ctx): Promise<{ data?: {}, error?: ErrorCode }> => {
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

    const row = {
      id: snowflake.id("discussion_comments"),
      userId: info.userId,
      discussionId: discussionId,
      date: date.utc(),
      content: content,
    }

    const [result0, result1] = await pg.begin(pg => [
      pg`INSERT INTO discussion_comments ${pg(row)}`,
      pg`UPDATE discussions SET last_comment_date=${date.utc()} WHERE id=${discussionId}`,
    ]);
    if (result0.count === 0) return { error: ErrorCode.Default };
    if (result1.count === 0) return { error: ErrorCode.Default };

    return { data: row };
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

    const result = await pg`
      DELETE FROM discussion_comments
      WHERE id=${commentId} AND user_id=${info.userId}
    `;
    if (result.count === 0) return { error: ErrorCode.Default };

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
    if (!info) return { error: ErrorCode.Default };

    const { discussionId, anchorId, type } = parsed.data;

    const result = await pg<ICommentRaw[]>`
      SELECT id, user_id, discussion_id, date, content FROM discussion_comments
      WHERE discussion_id=${discussionId}
      ${anchorId === "-1" ? pg`` : type === "newer" ? pg`AND id>${anchorId}` : pg`AND id<${anchorId}`}
      ORDER BY id ${anchorId === "-1" ? pg`DESC` : type === "newer" ? pg`ASC` : pg`DESC`}
      LIMIT 20
    `;

    const res: ICommentParsed[] = [];
    result.forEach(comment => {
      const parsed = iCommentSchema.safeParse(comment);
      if (parsed.success) res.push(parsed.data);
    })

    if (ctx.userIds === undefined) ctx.userIds = new Set();
    res.forEach((comment) => { ctx.userIds?.add(comment.userId) })

    return { data: res };
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
  getGuestDiscussionFeed,

  createArgument,
  deleteArgument,
  getArguments,
  voteArgument,

  createComment,
  deleteComment,
  getComments,
}