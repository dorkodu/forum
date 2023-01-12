import { z } from "zod";

const username = z.string().regex(/^([A-Za-z0-9_](?:(?:[A-Za-z0-9_]|(?:\.(?!\.))){0,14}(?:[A-Za-z0-9_]))?)$/);
const email = z.string().email().max(320);
const password = z.string().min(8);

const token = z.string();
const code = z.string();

const anchor = z.string();
const type = z.enum(["newer", "older"]);

const service = z.string().max(128);

export const sharedSchemas = {
  username,
  email,
  password,

  token,
  code,

  anchor,
  type,

  service,
}