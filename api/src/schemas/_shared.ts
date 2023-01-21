import { z } from "zod";

const name = z.string().min(1).max(64).trim();
const username = z.string().regex(/^([A-Za-z0-9_](?:(?:[A-Za-z0-9_]|(?:\.(?!\.))){0,14}(?:[A-Za-z0-9_]))?)$/);
const email = z.string().email().max(320).trim();
const password = z.string().min(8);
const bio = z.string().max(500).trim();

const title = z.string().min(1).max(100).trim();
const readme = z.string().min(1).max(100000).trim();
const commentContent = z.string().min(1).max(500).trim();
const argumentContent = z.string().min(1).max(500).trim();

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