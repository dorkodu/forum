import { z } from "zod";

export type IUser = IUserParsed;
export type IUserRaw = z.input<typeof iUserSchema>
export type IUserParsed = z.output<typeof iUserSchema>
export const iUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string(),
  joinedAt: z.string().transform((arg) => parseInt(arg)),
}).strict();