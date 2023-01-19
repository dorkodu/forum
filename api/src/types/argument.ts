import { z } from "zod";

export type IArgument = IArgumentParsed;
export type IArgumentRaw = z.input<typeof iArgumentSchema>
export type IArgumentParsed = z.output<typeof iArgumentSchema>
export const iArgumentSchema = z.object({
  id: z.string(),
  userId: z.string(),
  discussionId: z.string(),
  date: z.string().transform((arg) => parseInt(arg)),
  content: z.string(),
  type: z.boolean(),
  voteCount: z.string().transform((arg) => parseInt(arg)),
  voted: z.boolean(),
  votedType: z.boolean().nullable(),
}).strict();