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

function otp() {
  return cyptography.randomInt(100_000, 1_000_000);
}

export const crypto = {
  encryptPassword,
  comparePassword,
  sha256,
  bytes,
  otp,
}