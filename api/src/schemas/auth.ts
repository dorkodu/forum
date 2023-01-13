import { z } from "zod";
import { sharedSchemas } from "./_shared";

export const getAccessTokenSchema = z.object({
  code: sharedSchemas.code,
}).strict();