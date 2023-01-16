import { SchemaContext } from "./_schema";
import sage from "@dorkodu/sage-server";
import { ErrorCode } from "../types/error_codes";
import auth from "./auth";
import { createDiscussionSchema } from "../schemas/discussion";
import pg from "../pg";
import { snowflake } from "../lib/snowflake";
import { date } from "../lib/date";

const createDiscussion = sage.resource(
  {} as SchemaContext,
  undefined,
  async (arg, ctx): Promise<{ data?: {}, error?: ErrorCode }> => {
    const parsed = createDiscussionSchema.safeParse(arg);
    if (!parsed.success) return { error: ErrorCode.Default };

    const info = await auth.getAuthInfo(ctx);
    if (!info) return { error: ErrorCode.Default };

    const { title, readme } = parsed.data;

    const row = {
      id: snowflake.id("discussions"),
      user_id: info.userId,
      date: date.utc(),
      title: title,
      readme: readme,
      favourite_count: 0,
      argument_count: 0,
      comment_count: 0,
      last_update_date: -1,
      last_argument_date: -1,
      last_comment_date: -1,
    }

    const result = await pg`INSERT INTO discussions ${pg(row)}`;
    if (result.count === 0) return { error: ErrorCode.Default };

    return { data: {} };
  }
)

const deleteDiscussion = sage.resource(
  {} as SchemaContext,
  undefined,
  async (_arg, _ctx): Promise<{ data?: {}, error?: ErrorCode }> => {
    return { data: {} };
  }
)

const editDiscussion = sage.resource(
  {} as SchemaContext,
  undefined,
  async (_arg, _ctx): Promise<{ data?: {}, error?: ErrorCode }> => {
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

const createComment = sage.resource(
  {} as SchemaContext,
  undefined,
  async (_arg, _ctx): Promise<{ data?: {}, error?: ErrorCode }> => {
    return { data: {} };
  }
)

const deleteComment = sage.resource(
  {} as SchemaContext,
  undefined,
  async (_arg, _ctx): Promise<{ data?: {}, error?: ErrorCode }> => {
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

const createArgument = sage.resource(
  {} as SchemaContext,
  undefined,
  async (_arg, _ctx): Promise<{ data?: {}, error?: ErrorCode }> => {
    return { data: {} };
  }
)

const deleteArgument = sage.resource(
  {} as SchemaContext,
  undefined,
  async (_arg, _ctx): Promise<{ data?: {}, error?: ErrorCode }> => {
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

export default {
  createDiscussion,
  deleteDiscussion,
  editDiscussion,
  searchDiscussion,

  favouriteDiscussion,

  getUserDiscussionFeed,
  getGuestDiscussionFeed,

  createComment,
  deleteComment,
  getComments,

  createArgument,
  deleteArgument,
  getArguments,
  voteArgument,
}