import { z } from "zod";

export type IDiscussion = IDiscussionParsed;
export type IDiscussionRaw = z.input<typeof iDiscussionSchema>
export type IDiscussionParsed = z.output<typeof iDiscussionSchema>
export const iDiscussionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  date: z.string().transform((arg) => parseInt(arg)),
  title: z.string(),
  readme: z.string().optional(),
  favouriteCount: z.string().transform((arg) => parseInt(arg)),
  argumentCount: z.string().transform((arg) => parseInt(arg)),
  commentCount: z.string().transform((arg) => parseInt(arg)),
  lastUpdateDate: z.string().transform((arg) => parseInt(arg)),
  favourited: z.boolean(),
}).strict();