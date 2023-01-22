import { z } from "zod";
import { sharedSchemas } from "./_shared";

export const createDiscussionSchema = z.object({
  title: sharedSchemas.title,
  readme: sharedSchemas.readme,
}).strict();

export const deleteDiscussionSchema = z.object({
  discussionId: z.string(),
}).strict();

export const getDiscussionSchema = z.object({
  discussionId: z.string(),
}).strict();

export const editDiscussionSchema = z.object({
  discussionId: z.string(),
  title: sharedSchemas.title,
  readme: sharedSchemas.readme,
}).strict();

export const getUserDiscussionFeedSchema = z.object({
  anchorId: z.string(),
  type: z.enum(["newer", "older"]),
}).strict();

export const getFavouriteDiscussionFeedSchema = z.object({
  anchorId: z.string(),
  type: z.enum(["newer", "older"]),
}).strict();

export const getGuestDiscussionFeedSchema = z.object({
  anchorId: z.string(),
  type: z.enum(["newer", "older"]),
}).strict();

export const favouriteDiscussionSchema = z.object({
  discussionId: z.string(),
  favourited: z.boolean(),
}).strict();


export const createArgumentSchema = z.object({
  discussionId: z.string(),
  content: sharedSchemas.argumentContent,
  type: z.boolean(),
}).strict();

export const deleteArgumentSchema = z.object({
  argumentId: z.string(),
}).strict();

export const getArgumentsSchema = z.object({
  discussionId: z.string(),
  anchorId: z.string(),
  type: z.enum(["newer", "older", "top", "bottom"]),
}).strict();

export const voteArgumentSchema = z.object({
  argumentId: z.string(),
  type: z.enum(["up", "down", "none"]),
}).strict();


export const createCommentSchema = z.object({
  discussionId: z.string(),
  content: sharedSchemas.commentContent,
}).strict();

export const deleteCommentSchema = z.object({
  commentId: z.string(),
}).strict();

export const getCommentsSchema = z.object({
  discussionId: z.string(),
  anchorId: z.string(),
  type: z.enum(["newer", "older"]),
}).strict();