import { SchemaContext } from "./_schema";
import sage from "@dorkodu/sage-server";
import { ErrorCode } from "../types/error_codes";
import { getUserDiscussionsSchema, getUserSchema } from "../schemas/user";
import { z } from "zod";
import auth from "./auth";
import pg from "../pg";
import { IUser, IUserParsed, IUserRaw, iUserSchema } from "../types/user";
import { IDiscussion, IDiscussionParsed, IDiscussionRaw, iDiscussionSchema } from "../types/discussion";

const getUser = sage.resource(
  {} as SchemaContext,
  {} as z.infer<typeof getUserSchema>,
  async (arg, ctx): Promise<{ data?: IUser[], error?: ErrorCode }> => {
    const parsed = getUserSchema.safeParse(arg);
    if (!parsed.success) return { error: ErrorCode.Default };

    const info = await auth.getAuthInfo(ctx);
    if (!info) return { error: ErrorCode.Default };

    const username = parsed.data.username;

    if (username) {
      const [result]: [IUserRaw?] = await pg`
        SELECT id, name, username, bio, join_date, follower_count, following_count
        FROM users WHERE username=${username}
      `;
      if (!result) return { error: ErrorCode.Default };

      const res = iUserSchema.safeParse(result);

      if (res.success) {
        ctx.userId = res.data.id;
        return { data: [res.data] };
      }

      return { error: ErrorCode.Default };
    }
    else {
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
  {} as z.infer<typeof getUserDiscussionsSchema>,
  async (arg, ctx): Promise<{ data?: IDiscussion[], error?: ErrorCode }> => {
    const parsed = getUserDiscussionsSchema.safeParse(arg);
    if (!parsed.success) return { error: ErrorCode.Default };

    const info = await auth.getAuthInfo(ctx);
    if (!info) return { error: ErrorCode.Default };

    const { anchorId, type } = parsed.data;
    const userId = parsed.data.userId ?? ctx.userId;
    if (!userId) return { error: ErrorCode.Default };

    const result = await pg<IDiscussionRaw[]>`
      SELECT 
        d.id, d.user_id, d.date, d.title, d.readme, 
        d.favourite_count, d.argument_count, d.comment_count,
        d.last_update_date, d.last_argument_date, d.last_comment_date,
        (df.user_id IS NOT NULL) AS favourited
      FROM discussions d
      LEFT JOIN discussion_favourites df
      ON d.id=df.discussion_id AND df.user_id=${info.userId}
      WHERE d.user_id=${userId}
      ${anchorId === "-1" ? pg`` : type === "newer" ? pg`AND d.id>${anchorId}` : pg`AND d.id<${anchorId}`}
      ORDER BY d.id ${anchorId === "-1" ? pg`DESC` : type === "newer" ? pg`ASC` : pg`DESC`}
      LIMIT 20
    `;

    const res: IDiscussionParsed[] = [];
    result.forEach(argument => {
      const parsed = iDiscussionSchema.safeParse(argument);
      if (parsed.success) res.push(parsed.data);
    })

    return { data: res };
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