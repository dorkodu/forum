import { z } from "zod";

export type IComment = ICommentParsed;
export type ICommentRaw = z.input<typeof iCommentSchema>
export type ICommentParsed = z.output<typeof iCommentSchema>
export const iCommentSchema = z.object({
  id: z.string(),
  userId: z.string(),
  discussionId: z.string(),
  date: z.string().transform((arg) => parseInt(arg)),
  content: z.string(),
}).strict();