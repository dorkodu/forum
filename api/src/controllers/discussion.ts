import { SchemaContext } from "./_schema";
import sage from "@dorkodu/sage-server";
import { ErrorCode } from "../types/error_codes";

const createDiscussion = sage.resource(
  {} as SchemaContext,
  undefined,
  async (_arg, _ctx): Promise<{ data?: {}, error?: ErrorCode }> => {
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