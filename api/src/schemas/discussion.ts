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