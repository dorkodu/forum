import { z } from "zod";

const name = z.string().trim().min(1).max(64);
const username = z.string().trim().regex(/^([A-Za-z0-9_](?:(?:[A-Za-z0-9_]|(?:\.(?!\.))){0,14}(?:[A-Za-z0-9_]))?)$/);
const email = z.string().trim().email().max(320);
const password = z.string().min(8);
const bio = z.string().trim().max(500);

const title = z.string().trim().min(1).max(100);
const readme = z.string().trim().min(1).max(100000);
const commentContent = z.string().trim().min(1).max(500);
const argumentContent = z.string().trim().min(1).max(500);

const token = z.string();
const code = z.string();

const service = z.string().max(128);

export const sharedSchemas = {
  name,
  username,
  email,
  password,
  bio,

  title,
  readme,
  commentContent,
  argumentContent,

  token,
  code,

  service,
}