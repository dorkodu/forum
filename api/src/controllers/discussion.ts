import { SchemaContext } from "./_schema";
import sage from "@dorkodu/sage-server";
import { ErrorCode } from "../types/error_codes";
import auth from "./auth";
import { createArgumentSchema, createCommentSchema, createDiscussionSchema, deleteArgumentSchema, deleteCommentSchema, deleteDiscussionSchema, editDiscussionSchema, getDiscussionSchema } from "../schemas/discussion";
import pg from "../pg";
import { snowflake } from "../lib/snowflake";
import { date } from "../lib/date";
import { z } from "zod";
import { IDiscussion, IDiscussionRaw, iDiscussionSchema } from "../types/discussion";

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

    return { data: row };
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
        id, user_id, date, title, readme, 
        favourite_count, argument_count, comment_count,
        last_update_date, last_argument_date, last_comment_date
      FROM discussions WHERE id=${discussionId}
    `;
    const res = iDiscussionSchema.safeParse(result);
    if (!res.success) return { error: ErrorCode.Default };

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
      UPDATE discussions SET title=${title}, readme=${readme}
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
  async (arg, ctx): Promise<{ data?: {}, error?: ErrorCode }> => {
    const parsed = createArgumentSchema.safeParse(arg);
    if (!parsed.success) return { error: ErrorCode.Default };

    const info = await auth.getAuthInfo(ctx);
    if (!info) return { error: ErrorCode.Default };

    const { discussionId, content, type } = parsed.data;

    const row = {
      id: snowflake.id("discussion_arguments"),
      user_id: info.userId,
      discussion_id: discussionId,
      date: date.utc(),
      content: content,
      type: type,
      votes: 0,
    }

    const result = await pg`INSERT INTO discussion_arguments ${pg(row)}`;
    if (result.count === 0) return { error: ErrorCode.Default };

    return { data: {} };
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
  undefined,
  async (_arg, _ctx): Promise<{ data?: {}, error?: ErrorCode }> => {
    return { data: {} };
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
  async (arg, ctx): Promise<{ data?: {}, error?: ErrorCode }> => {
    const parsed = createCommentSchema.safeParse(arg);
    if (!parsed.success) return { error: ErrorCode.Default };

    const info = await auth.getAuthInfo(ctx);
    if (!info) return { error: ErrorCode.Default };

    const { discussionId, content } = parsed.data;

    const row = {
      id: snowflake.id("discussion_comments"),
      user_id: info.userId,
      discussion_id: discussionId,
      date: date.utc(),
      content: content,
    }

    const result = await pg`INSERT INTO discussion_comments ${pg(row)}`;
    if (result.count === 0) return { error: ErrorCode.Default };

    return { data: {} };
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
  undefined,
  async (_arg, _ctx): Promise<{ data?: {}, error?: ErrorCode }> => {
    return { data: {} };
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