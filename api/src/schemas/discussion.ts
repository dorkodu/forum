import { z } from "zod";
import { sharedSchemas } from "./_shared";

export const createDiscussionSchema = z.object({
  title: sharedSchemas.title,
  readme: sharedSchemas.readme,
}).strict();

export const deleteDiscussionSchema = z.object({
  discussionId: z.string(),
}).strict();

export const editDiscussionSchema = z.object({
  discussionId: z.string(),
  title: sharedSchemas.title,
  readme: sharedSchemas.readme,
}).strict();

export const searchDiscussionSchema = z.object({
  title: sharedSchemas.title,
}).strict();


export const createCommentSchema = z.object({
  discussionId: z.string(),
  content: sharedSchemas.commentContent,
}).strict();

export const deleteCommentSchema = z.object({
  commentId: z.string(),
}).strict();


export const createArgumentSchema = z.object({
  discussionId: z.string(),
  content: sharedSchemas.argumentContent,
  type: z.boolean(),
}).strict();

export const deleteArgumentSchema = z.object({
  argumentId: z.string(),
}).strict();