import { z } from "zod";
import { notificationTypes } from "./types";

export type INotification = INotificationParsed;
export type INotificationRaw = z.input<typeof iNotificationSchema>
export type INotificationParsed = z.output<typeof iNotificationSchema>
export const iNotificationSchema = z.object({
  id: z.string(),
  targetId: z.string(),
  currentId: z.string(),
  parentId: z.string(),
  childId: z.string().nullable().transform((arg) => arg === null ? undefined : arg),
  content: z.string().array().optional(),
  type: z.nativeEnum(notificationTypes),
  date: z.string().transform((arg) => parseInt(arg)),
}).strict();