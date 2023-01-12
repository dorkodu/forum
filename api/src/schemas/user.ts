import { z } from "zod";
import { sharedSchemas } from "./_shared";

export const changeUsernameSchema = z.object({
  newUsername: sharedSchemas.username,
}).strict();

export const initiateEmailChangeSchema = z.object({
  newEmail: sharedSchemas.email,
}).strict();

export const confirmEmailChangeSchema = z.object({
  token: sharedSchemas.token,
}).strict();

export const revertEmailChangeSchema = z.object({
  token: sharedSchemas.token,
}).strict();

export const initiatePasswordChangeSchema = z.object({
  username: sharedSchemas.username,
  email: sharedSchemas.email,
}).strict();

export const confirmPasswordChangeSchema = z.object({
  newPassword: sharedSchemas.password,
  token: sharedSchemas.token,
}).strict();