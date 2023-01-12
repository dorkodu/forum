import { Request, Response } from "express";
import { crypto } from "./crypto";
import { date } from "./date";
import { encoding } from "./encoding";
import { util } from "./util";

function create() {
  const selector = crypto.bytes(32);
  const validator = crypto.bytes(32);
  const full = `${encoding.fromBinary(selector, "base64url")}:${encoding.fromBinary(validator, "base64url")}`;

  return { selector, validator, full };
}

function parse(token: string): undefined | { selector: Buffer, validator: Buffer } {
  const split = token.split(":");
  if (!split[0] || !split[1]) return undefined;

  const selector = encoding.toBinary(split[0], "base64url");
  const validator = encoding.toBinary(split[1], "base64url");

  return { selector, validator };
}

function compare(raw: Buffer, encrypted: Buffer) {
  return encoding.compareBinary(crypto.sha256(raw), encrypted);
}

function check<
  T extends { validator: Buffer, expiresAt: string | number }
>(tkn: T, rawValidator: Buffer): boolean {
  if (!compare(rawValidator, tkn.validator)) return false;
  if (typeof tkn.expiresAt === "number") return date.utc() < tkn.expiresAt;
  return date.utc() < util.intParse(tkn.expiresAt, -1);
}

function attach(res: Response, token: { value: string, expiresAt: number }) {
  res.cookie("token", token.value, {
    secure: true,
    httpOnly: true,
    sameSite: true,
    expires: new Date(token.expiresAt),
  });
}

function detach(res: Response) {
  res.clearCookie("token");
}

function get(req: Request): string | undefined {
  return req.cookies["token"];
}

export const token = {
  create,
  parse,

  check,

  attach,
  detach,

  get,
}