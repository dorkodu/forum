import * as cyptography from "crypto";

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
  sha256,
  bytes,
  username,
}