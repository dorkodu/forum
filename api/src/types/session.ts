import { z } from "zod";

export type ISession = ISessionParsed;
export type ISessionRaw = z.input<typeof iSessionSchema>
export type ISessionParsed = z.output<typeof iSessionSchema>
export const iSessionSchema = z.object({
  id: z.string(),
  createdAt: z.string().transform((arg) => parseInt(arg)),
  expiresAt: z.string().transform((arg) => parseInt(arg)),
  userAgent: z.string(),
  ip: z.string(),
}).strict();