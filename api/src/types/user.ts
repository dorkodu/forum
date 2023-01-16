import { z } from "zod";

export type IUser = IUserParsed;
export type IUserRaw = z.input<typeof iUserSchema>
export type IUserParsed = z.output<typeof iUserSchema>
export const iUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  username: z.string(),
  bio: z.string(),
  joinedAt: z.string().transform((arg) => parseInt(arg)),
  followerCount: z.string().transform((arg) => parseInt(arg)),
  followingCount: z.string().transform((arg) => parseInt(arg)),
}).strict();