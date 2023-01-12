import { z } from "zod";
import { sharedSchemas } from "./_shared";

export const signupSchema = z.object({
  username: sharedSchemas.username,
  email: sharedSchemas.email,
}).strict();

export const verifySignupSchema = z.object({
  token: sharedSchemas.token,
}).strict();

export const confirmSignupSchema = z.object({
  username: sharedSchemas.username,
  email: sharedSchemas.email,
  password: sharedSchemas.password,
}).strict();

export const loginSchema = z.object({
  info: z.string(),
  password: sharedSchemas.password,
}).strict();

export const verifyLoginSchema = z.object({
  token: sharedSchemas.token,
}).strict();