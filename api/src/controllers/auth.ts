import axios from "axios";

import { token } from "../lib/token";
import { SchemaContext } from "./_schema";
import sage from "@dorkodu/sage-server";
import { ErrorCode } from "../types/error_codes";
import { getAccessTokenSchema } from "../schemas/auth"
import { config } from "../config";
import { date } from "../lib/date";
import pg from "../pg";
import { IUser, iUserSchema } from "../types/user";
import { crypto } from "../lib/crypto";

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
  async (_arg, ctx): Promise<{ data?: IUser, error?: ErrorCode }> => {
    const info = await getAuthInfo(ctx);
    if (!info) return { error: ErrorCode.Default };

    const [result] = await pg`
      SELECT id, name, username, bio, join_date, follower_count, following_count,
      FALSE AS follower, FALSE AS following
      FROM users WHERE id=${info.userId}
    `
    if (!result) return { error: ErrorCode.Default };

    const res = iUserSchema.safeParse(result);
    if (res.success) return { data: res.data };
    return { error: ErrorCode.Default };
  }
)

const logout = sage.resource(
  {} as SchemaContext,
  undefined,
  async (_arg, ctx): Promise<{ data?: {}, error?: ErrorCode }> => {
    const tkn = token.get(ctx.req);
    if (!tkn) return { error: ErrorCode.Default };
    if (!(await queryExpireAccessToken(tkn))) return { error: ErrorCode.Default };
    token.detach(ctx.res);

    return { data: {} };
  }
)

const getAccessToken = sage.resource(
  {} as SchemaContext,
  {} as { code: string },
  async (arg, ctx): Promise<{ data?: IUser, error?: ErrorCode }> => {
    const parsed = getAccessTokenSchema.safeParse(arg);
    if (!parsed.success) return { error: ErrorCode.Default };

    const accessToken = await queryGetAccessToken(parsed.data.code);
    if (!accessToken) return { error: ErrorCode.Default };

    const userData = await queryUserData(accessToken.token);
    if (!userData) return { error: ErrorCode.Default };

    // Check if account with the given user id already exists
    const [result0]: [{ exists: boolean }?] = await pg`
      SELECT EXISTS (
        SELECT * FROM users WHERE id=${userData.id}
      )
    `;
    if (!result0) return { error: ErrorCode.Default };

    // Check if the username is already being used by the user or someone else
    const [result1]: [{ id: string }?] = await pg`
      SELECT id FROM users WHERE username_ci=${userData.username}
    `;

    // If someone else is using the user's username, try to give them a random username
    if (result1 && userData.id !== result1.id) {
      const username = crypto.username();
      const result2 = await pg`
        UPDATE users
        SET username=${username}, username_ci=${username}
        WHERE id=${result1.id}
      `;
      if (result2.count === 0) return { error: ErrorCode.Default };
    }

    // If first time logging in via Dorkodu ID, create an account for the user
    if (!result0.exists) {
      const row = {
        id: userData.id,
        name: userData.name,
        nameCi: userData.name.toLowerCase(),
        username: userData.username,
        usernameCi: userData.username.toLowerCase(),
        bio: userData.bio,
        joinDate: date.utc(),
        followerCount: 0,
        followingCount: 0,
      }

      const result = await pg`INSERT INTO users ${pg(row)}`;
      if (result.count === 0) return { error: ErrorCode.Default };

      // Attach the access token for 30 days to the user
      token.attach(ctx.res, { value: accessToken.token, expiresAt: date.day(30) });

      return { data: { ...row, follower: false, following: false } };
    }
    // If not the first time logging in via Dorkodu ID, query the user
    else {
      const { name, username, bio } = userData;

      const result0 = await pg`
        UPDATE users
        SET
          name=${name},
          name_ci=${name.toLowerCase()},
          username=${username},
          username_ci=${username.toLowerCase()},
          bio=${bio}
        WHERE id=${userData.id}
      `;
      if (result0.count === 0) return { error: ErrorCode.Default };

      const [result1] = await pg`
        SELECT id, name, username, bio, join_date, follower_count, following_count,
        FALSE AS follower, FALSE AS following
        FROM users WHERE id=${userData.id}
      `;
      if (!result1) return { error: ErrorCode.Default };

      const res = iUserSchema.safeParse(result1);
      if (!res.success) return { error: ErrorCode.Default };

      // Attach the access token for 30 days to the user
      token.attach(ctx.res, { value: accessToken.token, expiresAt: date.day(30) });

      return { data: res.data };
    }
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

async function queryExpireAccessToken(token: string): Promise<{} | undefined> {
  return new Promise((resolve) => {
    switch (config.env) {
      case "development":
        axios.post(
          "http://id_api:8001/api",
          { a: { res: "expireAccessToken", arg: { token } } }
        )
          .then((value) => { resolve(value.data.a.data) })
          .catch((_reason) => { resolve(undefined) })
        break;
      case "production":
        axios.post(
          "https://id.dorkodu.com/api",
          { a: { res: "expireAccessToken", arg: { token } } }
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
  name: string;
  username: string;
  bio: string;
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
  logout,
  getAccessToken,

  getAuthInfo,
}