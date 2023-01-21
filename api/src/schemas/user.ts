import { z } from "zod";
import { sharedSchemas } from "./_shared";

export const getUserSchema = z.object({
  ids: z.string().array().optional(),
  username: z.string().optional(),
}).strict();

export const editUserSchema = z.object({
  name: sharedSchemas.name,
  bio: sharedSchemas.bio,
}).strict();

export const getUserDiscussionsSchema = z.object({
  userId: z.string().optional(),
  anchorId: z.string(),
  type: z.enum(["newer", "older"]),
}).strict();

export const followUserSchema = z.object({
  userId: z.string(),
  type: z.boolean(),
}).strict();

export const getUserFollowersSchema = z.object({
  userId: z.string().optional(),
  anchorId: z.string(),
  type: z.enum(["newer", "older"]),
}).strict();

export const getUserFollowingSchema = z.object({
  userId: z.string().optional(),
  anchorId: z.string(),
  type: z.enum(["newer", "older"]),
}).strict();