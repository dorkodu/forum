import { z } from "zod";
import { sharedSchemas } from "./_shared";

export const createDiscussionSchema = z.object({
  title: sharedSchemas.title,
  readme: sharedSchemas.readme,
}).strict()