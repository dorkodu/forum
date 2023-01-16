import { z } from "zod";

const name = z.string().min(1).max(64);
const username = z.string().regex(/^([A-Za-z0-9_](?:(?:[A-Za-z0-9_]|(?:\.(?!\.))){0,14}(?:[A-Za-z0-9_]))?)$/);
const email = z.string().email().max(320);
const password = z.string().min(8);
const bio = z.string().max(500);

const title = z.string().max(100);
const readme = z.string().max(100000);
const commentContent = z.string().max(500);
const argumentContent = z.string().max(500);

const token = z.string();
const code = z.string();

const anchor = z.string();
const type = z.enum(["newer", "older"]);

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

  anchor,
  type,

  service,
}