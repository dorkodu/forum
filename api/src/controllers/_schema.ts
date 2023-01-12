import sage from "@dorkodu/sage-server";
import { NextFunction, Request, Response } from "express";

import auth from "./auth";
import user from "./user";
import session from "./session";

export interface SchemaContext {
  readonly req: Request;
  readonly res: Response;
  readonly next: NextFunction;

  triedAuth?: boolean;
  userId?: string;
  sessionId?: string;
}

export type Schema = typeof schema
export const schema = sage.schema(
  {} as SchemaContext,
  {
    /* auth */
    auth: auth.auth,

    signup: auth.signup,
    verifySignup: auth.verifySignup,
    confirmSignup: auth.confirmSignup,

    login: auth.login,
    verifyLogin: auth.verifyLogin,

    logout: auth.logout,

    /* user */
    getUser: user.getUser,

    changeUsername: user.changeUsername,

    initiateEmailChange: user.initiateEmailChange,
    confirmEmailChange: user.confirmEmailChange,
    revertEmailChange: user.revertEmailChange,

    initiatePasswordChange: user.initiatePasswordChange,
    confirmPasswordChange: user.confirmPasswordChange,

    /* session */
    getCurrentSession: session.getCurrentSession,
    getSessions: session.getSessions,
    terminateSession: session.terminateSession,
  }
)