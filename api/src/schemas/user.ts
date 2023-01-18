import { z } from "zod";

export const getUserSchema = z.object({
  ids: z.string().array().optional(),
}).strict();