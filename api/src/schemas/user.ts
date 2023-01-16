import { z } from "zod";
import { sharedSchemas } from "./_shared";

export const editUserSchema = z.object({
  name: sharedSchemas.name.optional(),
  bio: sharedSchemas.bio.optional(),
}).strict();