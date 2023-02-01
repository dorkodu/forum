import * as cyptography from "crypto";
import bcrypt from "bcrypt";

import { config } from "../config";
import { encoding } from "./encoding";

async function encryptPassword(raw: string) {
  return await bcrypt.hash(sha256(raw).toString("base64"), config.bcryptRounds);
}

async function comparePassword(raw: string, encrypted: Buffer) {
  return await bcrypt.compare(sha256(raw).toString("base64"), encoding.fromBinary(encrypted, "utf8"));
}

function sha256(input: cyptography.BinaryLike) {
  return cyptography.createHash("sha256").update(input).digest();
}

function bytes(length: number) {
  return cyptography.randomBytes(length);
}

function username() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < 16; ++i) out += chars[cyptography.randomInt(0, chars.length)];
  return out;
}

export const crypto = {
  encryptPassword,
  comparePassword,
  sha256,
  bytes,
  username,
}