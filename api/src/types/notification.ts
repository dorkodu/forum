import { z } from "zod";

export type INotification = INotificationParsed;
export type INotificationRaw = z.input<typeof iNotificationSchema>
export type INotificationParsed = z.output<typeof iNotificationSchema>
export const iNotificationSchema = z.object({
  id: z.string(),
  targetId: z.string(),
  currentId: z.string(),
  entityId: z.string(),
  type: z.number(),
  date: z.string().transform((arg) => parseInt(arg)),
}).strict();