import axios from "axios";

import { token } from "../lib/token";
import { SchemaContext } from "./_schema";
import sage from "@dorkodu/sage-server";
import { ErrorCode } from "../types/error_codes";

async function middleware(ctx: SchemaContext) {
  const rawToken = token.get(ctx.req);
  if (!rawToken) return;

  const access = await queryCheckAccess(rawToken);
  if (!access) return;

  ctx.userId = access.userId;
}

const auth = sage.resource(
  {} as SchemaContext,
  undefined,
  async (_arg, ctx): Promise<{ data?: {}, error?: ErrorCode }> => {
    if (!await getAuthInfo(ctx)) return { error: ErrorCode.Default };
    return { data: {} };
  }
)

async function getAuthInfo(ctx: SchemaContext) {
  if (!ctx.triedAuth) await middleware(ctx);
  ctx.triedAuth = true;

  if (ctx.userId === undefined) return undefined;
  return { userId: ctx.userId };
}

async function queryCheckAccess(_rawToken: string): Promise<{ userId: string } | undefined> {
  axios.post("https://id.dorkodu.com/api", {a: {}})
  return undefined;
}

export default {
  auth,
}