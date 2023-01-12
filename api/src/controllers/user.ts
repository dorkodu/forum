import {
  changeUsernameSchema,
  confirmEmailChangeSchema,
  confirmPasswordChangeSchema,
  initiateEmailChangeSchema,
  initiatePasswordChangeSchema,
  revertEmailChangeSchema
} from "../schemas/user";
import sage from "@dorkodu/sage-server";
import { SchemaContext } from "./_schema";
import { z } from "zod";
import auth from "./auth";
import pg from "../pg";
import { IUserParsed, IUserRaw, iUserSchema } from "../types/user";
import { token } from "../lib/token";
import { crypto } from "../lib/crypto";
import { mailer } from "../lib/mailer";
import { date } from "../lib/date";
import { snowflake } from "../lib/snowflake";
import { util } from "../lib/util";
import { ErrorCode } from "../types/error_codes";

const getUser = sage.resource(
  {} as SchemaContext,
  undefined,
  async (_arg, ctx): Promise<{ data?: IUserParsed, error?: ErrorCode }> => {
    const info = await auth.getAuthInfo(ctx);
    if (!info) return { error: ErrorCode.Default };

    const [result]: [IUserRaw?] = await pg`
      SELECT id, username, email, joined_at FROM users WHERE id=${info.userId}
    `;
    const parsed = iUserSchema.safeParse(result);
    if (!parsed.success) return { error: ErrorCode.Default };

    return { data: parsed.data };
  }
)

const changeUsername = sage.resource(
  {} as SchemaContext,
  {} as z.infer<typeof changeUsernameSchema>,
  async (arg, ctx): Promise<{ data?: {}, error?: ErrorCode }> => {
    const parsed = changeUsernameSchema.safeParse(arg);
    if (!parsed.success) return { error: ErrorCode.Default };

    const info = await auth.getAuthInfo(ctx);
    if (!info) return { error: ErrorCode.Default };

    const { newUsername } = parsed.data;
    const result = await pg`UPDATE users SET username=${newUsername} WHERE id=${info.userId}`;
    if (result.count === 0) return { error: ErrorCode.Default };

    return { data: {} };
  }
)

const initiateEmailChange = sage.resource(
  {} as SchemaContext,
  {} as z.infer<typeof initiateEmailChangeSchema>,
  async (arg, ctx): Promise<{ data?: {}, error?: ErrorCode }> => {
    const parsed = initiateEmailChangeSchema.safeParse(arg);
    if (!parsed.success) return { error: ErrorCode.Default };

    const info = await auth.getAuthInfo(ctx);
    if (!info) return { error: ErrorCode.Default };

    const [result0]: [{ email: string }?] = await pg`
      SELECT email FROM users WHERE id=${info.userId}
    `;
    if (!result0) return { error: ErrorCode.Default };
    if (result0.email === parsed.data.newEmail) return { error: ErrorCode.Default };

    const newEmail = parsed.data.newEmail;
    const tkn = token.create();
    const row = {
      id: snowflake.id("email_confirm_email"),
      user_id: info.userId,
      email: newEmail,
      selector: tkn.selector,
      validator: crypto.sha256(tkn.validator),
      issued_at: date.utc(),
      sent_at: -1,
      expires_at: -1,
    }

    mailer.sendConfirmEmailChange(newEmail, tkn.full);

    row.sent_at = date.utc();
    row.expires_at = date.hour(1);
    const result1 = await pg`INSERT INTO email_confirm_email ${pg(row)}`;
    if (result1.count === 0) return { error: ErrorCode.Default };

    return { data: {} };
  }
)

const confirmEmailChange = sage.resource(
  {} as SchemaContext,
  {} as z.infer<typeof confirmEmailChangeSchema>,
  async (arg, _ctx): Promise<{ data?: {}, error?: ErrorCode }> => {
    const parsed = confirmEmailChangeSchema.safeParse(arg);
    if (!parsed.success) return { error: ErrorCode.Default };

    const tkn0 = token.parse(parsed.data.token);
    if (!tkn0) return { error: ErrorCode.Default };

    const [result0]: [{ id: string, userId: string, email: string, validator: Buffer, sentAt: string, expiresAt: string }?] = await pg`
      SELECT id, user_id, email, validator, sent_at, expires_at FROM email_confirm_email
      WHERE selector=${tkn0.selector}
    `;
    if (!result0) return { error: ErrorCode.Default };
    if (!token.check(result0, tkn0.validator)) return { error: ErrorCode.Default };
    if (util.intParse(result0.sentAt, -1) === -1) return { error: ErrorCode.Default };

    const [result1]: [{ email: string }?] = await pg`SELECT email FROM users WHERE id=${result0.userId}`;
    if (!result1) return { error: ErrorCode.Default };
    if (result1.email === result0.email) return { error: ErrorCode.Default };

    const [result2]: [{ count: string }?] = await pg`
      SELECT COUNT(*) FROM email_confirm_email
      WHERE id>${result0.id} AND user_id=${result0.userId}
    `;
    if (!result2) return { error: ErrorCode.Default };
    if (util.intParse(result2.count, -1) !== 0) return { error: ErrorCode.Default };

    const oldEmail = result1.email;
    const tkn1 = token.create();
    const row = {
      id: snowflake.id("email_revert_email"),
      user_id: result0.userId,
      email: oldEmail,
      selector: tkn1.selector,
      validator: crypto.sha256(tkn1.validator),
      issued_at: date.utc(),
      sent_at: -1,
      expires_at: -1,
    }

    mailer.sendRevertEmailChange(oldEmail, tkn1.full);

    row.sent_at = date.utc();
    row.expires_at = date.day(30);
    const [result3, result4, result5] = await pg.begin(pg => [
      pg`INSERT INTO email_revert_email ${pg(row)}`,
      pg`UPDATE users SET email=${result0.email} WHERE id=${result0.userId}`,
      pg`UPDATE email_confirm_email SET expires_at=${date.utc()} WHERE id=${result0.id}`
    ]);
    if (!result3.count) return { error: ErrorCode.Default };
    if (!result4.count) return { error: ErrorCode.Default };
    if (!result5.count) return { error: ErrorCode.Default };

    return { data: {} };
  }
)

const revertEmailChange = sage.resource(
  {} as SchemaContext,
  {} as z.infer<typeof revertEmailChangeSchema>,
  async (arg, _ctx): Promise<{ data?: {}, error?: ErrorCode }> => {
    const parsed = revertEmailChangeSchema.safeParse(arg);
    if (!parsed.success) return { error: ErrorCode.Default };

    const tkn0 = token.parse(parsed.data.token);
    if (!tkn0) return { error: ErrorCode.Default };

    const [result0]: [{ id: string, userId: string, email: string, validator: Buffer, sentAt: string, expiresAt: string }?] = await pg`
      SELECT id, user_id, email, validator, sent_at, expires_at FROM email_revert_email
      WHERE selector=${tkn0.selector}
    `;
    if (!result0) return { error: ErrorCode.Default };
    if (!token.check(result0, tkn0.validator)) return { error: ErrorCode.Default };
    if (util.intParse(result0.sentAt, -1) === -1) return { error: ErrorCode.Default };

    const [result1]: [{ email: string }?] = await pg` SELECT email FROM users WHERE id=${result0.userId}`;
    if (!result1) return { error: ErrorCode.Default };
    if (result1.email === result0.email) return { error: ErrorCode.Default };

    const [result2, result3, _result4] = await pg.begin(pg => [
      pg`UPDATE users SET email=${result0.email} WHERE id=${result0.userId}`,
      pg`UPDATE email_revert_email SET expires_at=${date.utc()} WHERE id=${result0.id}`,
      pg`UPDATE email_revert_email SET expires_at=${date.utc()} 
         WHERE id>${result0.id} AND user_id=${result0.userId}`
    ]);
    if (!result2.count) return { error: ErrorCode.Default };
    if (!result3.count) return { error: ErrorCode.Default };

    return { data: {} };
  }
)

const initiatePasswordChange = sage.resource(
  {} as SchemaContext,
  {} as z.infer<typeof initiatePasswordChangeSchema>,
  async (arg, _ctx): Promise<{ data?: {}, error?: ErrorCode }> => {
    const parsed = initiatePasswordChangeSchema.safeParse(arg);
    if (!parsed.success) return { error: ErrorCode.Default };

    (async () => {
      const { username, email } = parsed.data;

      const [result0]: [{ id: string }?] = await pg`
        SELECT id FROM users WHERE username=${username} AND email=${email}
      `;
      if (!result0) return;

      const tkn = token.create();
      const row = {
        id: snowflake.id("email_change_password"),
        user_id: result0.id,
        email: email,
        selector: tkn.selector,
        validator: crypto.sha256(tkn.validator),
        issued_at: date.utc(),
        sent_at: -1,
        expires_at: -1,
      }

      mailer.sendConfirmPasswordChange(email, tkn.full);

      row.sent_at = date.utc();
      row.expires_at = date.hour(1);
      await pg`INSERT INTO email_change_password ${pg(row)}`;
    })();

    return { data: {} };
  }
)

const confirmPasswordChange = sage.resource(
  {} as SchemaContext,
  {} as z.infer<typeof confirmPasswordChangeSchema>,
  async (arg, _ctx): Promise<{ data?: {}, error?: ErrorCode }> => {
    const parsed = confirmPasswordChangeSchema.safeParse(arg);
    if (!parsed.success) return { error: ErrorCode.Default };

    const tkn = token.parse(parsed.data.token);
    if (!tkn) return { error: ErrorCode.Default };

    const [result0]: [{ id: string, userId: string, email: string, validator: Buffer, sentAt: string, expiresAt: string }?] = await pg`
      SELECT id, user_id, email, validator, sent_at, expires_at FROM email_change_password
      WHERE selector=${tkn.selector}
    `;
    if (!result0) return { error: ErrorCode.Default };
    if (!token.check(result0, tkn.validator)) return { error: ErrorCode.Default };
    if (util.intParse(result0.sentAt, -1) === -1) return { error: ErrorCode.Default };

    const [result2]: [{ count: string }?] = await pg`
      SELECT COUNT(*) FROM email_change_password
      WHERE id>${result0.id} AND user_id=${result0.userId}
    `;
    if (!result2) return { error: ErrorCode.Default };
    if (util.intParse(result2.count, -1) !== 0) return { error: ErrorCode.Default };

    const password = await crypto.encryptPassword(parsed.data.newPassword);
    const [result3, _result4, result5] = await pg.begin(pg => [
      pg`UPDATE users SET password=${password} WHERE id=${result0.userId}`,
      pg`UPDATE sessions SET expires_at=${date.utc()} WHERE user_id=${result0.userId} AND expires_at>${date.utc()}`,
      pg`UPDATE email_change_password SET expires_at=${date.utc()} WHERE id=${result0.id}`
    ])
    if (result3.count === 0) return { error: ErrorCode.Default };
    if (result5.count === 0) return { error: ErrorCode.Default };

    return { data: {} };
  }
)

export default {
  getUser,

  changeUsername,

  initiateEmailChange,
  confirmEmailChange,
  revertEmailChange,

  initiatePasswordChange,
  confirmPasswordChange,
}