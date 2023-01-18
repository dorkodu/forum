import { SchemaContext } from "./_schema";
import sage from "@dorkodu/sage-server";
import { ErrorCode } from "../types/error_codes";
import { getUserSchema } from "../schemas/user";
import { z } from "zod";
import auth from "./auth";
import pg from "../pg";
import { IUser, IUserParsed, IUserRaw, iUserSchema } from "../types/user";

const getUser = sage.resource(
  {} as SchemaContext,
  {} as z.infer<typeof getUserSchema>,
  async (arg, ctx): Promise<{ data?: IUser[], error?: ErrorCode }> => {
    const parsed = getUserSchema.safeParse(arg);
    if (!parsed.success) return { error: ErrorCode.Default };

    const info = await auth.getAuthInfo(ctx);
    if (!info) return { error: ErrorCode.Default };

    let ids: string[] | undefined = undefined;
    if (parsed.data.ids) ids = parsed.data.ids;
    else if (ctx.userIds) ids = Array.from(ctx.userIds);
    if (!ids) return { error: ErrorCode.Default };
    if (ids.length > 20) return { error: ErrorCode.Default };

    const result = await pg<IUserRaw[]>`
      SELECT id, name, username, bio, join_date, follower_count, following_count
      FROM users WHERE id IN ${pg(ids)}
    `;

    const res: IUserParsed[] = [];
    result.forEach(user => {
      const parsed = iUserSchema.safeParse(user);
      if (parsed.success) res.push(parsed.data);
    })

    return { data: res };
  }
)

const editUser = sage.resource(
  {} as SchemaContext,
  undefined,
  async (_arg, _ctx): Promise<{ data?: {}, error?: ErrorCode }> => {
    return { data: {} };
  }
)

const searchUser = sage.resource(
  {} as SchemaContext,
  undefined,
  async (_arg, _ctx): Promise<{ data?: {}, error?: ErrorCode }> => {
    return { data: {} };
  }
)

const getUserDiscussions = sage.resource(
  {} as SchemaContext,
  undefined,
  async (_arg, _ctx): Promise<{ data?: {}, error?: ErrorCode }> => {
    return { data: {} };
  }
)

const followUser = sage.resource(
  {} as SchemaContext,
  undefined,
  async (_arg, _ctx): Promise<{ data?: {}, error?: ErrorCode }> => {
    return { data: {} };
  }
)

const getUserFollowers = sage.resource(
  {} as SchemaContext,
  undefined,
  async (_arg, _ctx): Promise<{ data?: {}, error?: ErrorCode }> => {
    return { data: {} };
  }
)

const getUserFollowing = sage.resource(
  {} as SchemaContext,
  undefined,
  async (_arg, _ctx): Promise<{ data?: {}, error?: ErrorCode }> => {
    return { data: {} };
  }
)

export default {
  getUser,
  editUser,
  searchUser,

  getUserDiscussions,

  followUser,
  getUserFollowers,
  getUserFollowing,
}