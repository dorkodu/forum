import axios from "axios";

import { token } from "../lib/token";
import { SchemaContext } from "./_schema";
import sage from "@dorkodu/sage-server";
import { ErrorCode } from "../types/error_codes";
import { getAccessTokenSchema } from "../schemas/auth"
import { config } from "../config";
import { date } from "../lib/date";

async function middleware(ctx: SchemaContext) {
  const rawToken = token.get(ctx.req);
  if (!rawToken) return;

  const auth = await queryAuth(rawToken);
  if (!auth) return;

  ctx.userId = auth.userId;
}

const auth = sage.resource(
  {} as SchemaContext,
  undefined,
  async (_arg, ctx): Promise<{ data?: {}, error?: ErrorCode }> => {
    if (!await getAuthInfo(ctx)) return { error: ErrorCode.Default };
    return { data: {} };
  }
)

const getAccessToken = sage.resource(
  {} as SchemaContext,
  {} as { code: string },
  async (arg, ctx): Promise<{ data?: {}, error?: ErrorCode }> => {
    const parsed = getAccessTokenSchema.safeParse(arg);
    if (!parsed.success) return { error: ErrorCode.Default };

    const accessToken = await queryGetAccessToken(parsed.data.code);
    if (!accessToken) return { error: ErrorCode.Default };

    // Attach the access token for 30 days to the user
    token.attach(ctx.res, { value: accessToken.token, expiresAt: date.day(30) });

    return { data: {} };
  }
)

async function getAuthInfo(ctx: SchemaContext) {
  if (!ctx.triedAuth) await middleware(ctx);
  ctx.triedAuth = true;

  if (ctx.userId === undefined) return undefined;
  return { userId: ctx.userId };
}

async function queryAuth(rawToken: string): Promise<{ userId: string } | undefined> {
  return new Promise((resolve) => {
    switch (config.env) {
      case "development":
        axios.post(
          "http://id_api:8001/api",
          { a: { res: "checkAccess", arg: { token: rawToken } } }
        )
          .then((value) => { resolve(value.data.a.data) })
          .catch((_reason) => { resolve(undefined) })
        break;
      case "production":
        axios.post(
          "https://id.dorkodu.com/api",
          { a: { res: "checkAccess", arg: { token: rawToken } } }
        )
          .then((value) => { resolve(value.data.a.data) })
          .catch((_reason) => { resolve(undefined) })
        break;
      default: resolve(undefined);
    }
  })
}

async function queryGetAccessToken(code: string): Promise<{ token: string } | undefined> {
  return new Promise((resolve) => {
    switch (config.env) {
      case "development":
        axios.post(
          "http://id_api:8001/api",
          { a: { res: "getAccessToken", arg: { code } } }
        )
          .then((value) => { resolve(value.data.a.data) })
          .catch((_reason) => { resolve(undefined) })
        break;
      case "production":
        axios.post(
          "https://id.dorkodu.com/api",
          { a: { res: "getAccessToken", arg: { code } } }
        )
          .then((value) => { resolve(value.data.a.data) })
          .catch((_reason) => { resolve(undefined) })
        break;
      default: resolve(undefined);
    }
  })
}

export default {
  auth,
  getAccessToken,
}