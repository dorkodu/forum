import axios from "axios";

import { token } from "../lib/token";
import { SchemaContext } from "./_schema";
import sage from "@dorkodu/sage-server";
import { ErrorCode } from "../types/error_codes";
import { getAccessTokenSchema } from "../schemas/auth"
import { config } from "../config";
import { date } from "../lib/date";
import pg from "../pg";
import { util } from "../lib/util";

async function middleware(ctx: SchemaContext) {
  const rawToken = token.get(ctx.req);
  if (!rawToken) return;

  const auth = await queryAuth(rawToken);
  if (!auth) return;

  ctx.shared.userId = auth.userId;
}

const auth = sage.resource(
  {} as SchemaContext,
  undefined,
  async (_arg, ctx): Promise<{ data?: { userId: string }, error?: ErrorCode }> => {
    const info = await getAuthInfo(ctx);
    if (!info) return { error: ErrorCode.Default };
    return { data: { userId: info.userId } };
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

    const userData = await queryUserData(accessToken.token);
    if (!userData) return { error: ErrorCode.Default };

    // Check if account with the given user id already exists
    const [result0]: [{ count: string }?] = await pg`SELECT COUNT(*) FROM users WHERE id=${userData.id}`
    if (!result0) return { error: ErrorCode.Default };

    // If first time logging in via Dorkodu ID, create an account for the user
    if (util.intParse(result0.count, 1) === 0) {
      const row = {
        id: userData.id,
        name: userData.username,
        username: userData.username,
        bio: "",
        join_date: date.utc(),
        follower_count: 0,
        following_count: 0,
      }

      const result = await pg`INSERT INTO users ${pg(row)}`;
      if (result.count === 0) return { error: ErrorCode.Default };
    }

    // Attach the access token for 30 days to the user
    token.attach(ctx.res, { value: accessToken.token, expiresAt: date.day(30) });

    return { data: {} };
  }
)

async function getAuthInfo(ctx: SchemaContext) {
  if (!ctx.shared.triedAuth) await middleware(ctx);
  ctx.shared.triedAuth = true;

  if (ctx.shared.userId === undefined) return undefined;
  return { userId: ctx.shared.userId };
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

interface UserData {
  id: string;
  username: string;
  email: string;
  joinedAt: number;
}

async function queryUserData(token: string): Promise<UserData | undefined> {
  return new Promise((resolve) => {
    switch (config.env) {
      case "development":
        axios.post(
          "http://id_api:8001/api",
          { a: { res: "getUserData", arg: { token } } }
        )
          .then((value) => { resolve(value.data.a.data) })
          .catch((_reason) => { resolve(undefined) })
        break;
      case "production":
        axios.post(
          "https://id.dorkodu.com/api",
          { a: { res: "getUserData", arg: { token } } }
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

  getAuthInfo,
}