import { getSessionsSchema, terminateSessionSchema } from "../schemas/session";
import sage from "@dorkodu/sage-server";
import { SchemaContext } from "./_schema";
import { z } from "zod";
import auth from "./auth";
import pg from "../pg";
import { ISessionParsed, ISessionRaw, iSessionSchema } from "../types/session";
import { date } from "../lib/date";
import { ErrorCode } from "../types/error_codes";

const getCurrentSession = sage.resource(
  {} as SchemaContext,
  undefined,
  async (_arg, ctx): Promise<{ data?: ISessionParsed, error?: ErrorCode }> => {
    const info = await auth.getAuthInfo(ctx);
    if (!info) return { error: ErrorCode.Default };

    const [result]: [ISessionRaw?] = await pg`
      SELECT id, created_at, expires_at, user_agent, ip FROM sessions WHERE id=${info.sessionId}
    `;
    const parsed = iSessionSchema.safeParse(result);
    if (!parsed.success) return { error: ErrorCode.Default };

    return { data: parsed.data };
  }
)

const getSessions = sage.resource(
  {} as SchemaContext,
  {} as z.infer<typeof getSessionsSchema>,
  async (arg, ctx): Promise<{ data?: ISessionParsed[], error?: ErrorCode }> => {
    const parsed = getSessionsSchema.safeParse(arg);
    if (!parsed.success) return { error: ErrorCode.Default };

    const info = await auth.getAuthInfo(ctx);
    if (!info) return { error: ErrorCode.Default };

    const { anchor, type } = parsed.data;
    const result = await pg<ISessionRaw[]>`
      SELECT id, created_at, expires_at, user_agent, ip FROM sessions
      WHERE user_id=${info.userId} AND expires_at>${date.utc()}
      ${anchor === "-1" ? pg`` : type === "newer" ? pg`AND id>${anchor}` : pg`AND id<${anchor}`}
      ORDER BY id ${anchor === "-1" ? pg`DESC` : type === "newer" ? pg`ASC` : pg`DESC`}
      LIMIT 10
    `;
    if (result.length === 0) return { error: ErrorCode.Default };

    const res: ISessionParsed[] = [];
    result.forEach(session => {
      const parsed = iSessionSchema.safeParse(session);
      if (parsed.success) res.push(parsed.data);
    })

    return { data: res };
  }
)

const terminateSession = sage.resource(
  {} as SchemaContext,
  {} as z.infer<typeof terminateSessionSchema>,
  async (arg, ctx): Promise<{ data?: {}, error?: ErrorCode }> => {
    const parsed = terminateSessionSchema.safeParse(arg);
    if (!parsed.success) return { error: ErrorCode.Default };

    const info = await auth.getAuthInfo(ctx);
    if (!info) return { error: ErrorCode.Default };

    const { sessionId } = parsed.data;

    const result = await pg`
      UPDATE sessions SET expires_at=${date.utc()} 
      WHERE id=${sessionId} AND user_id=${info.userId}
    `;
    if (result.count === 0) return { error: ErrorCode.Default };

    return { data: {} };
  }
)

export default {
  getCurrentSession,
  getSessions,
  terminateSession,
}