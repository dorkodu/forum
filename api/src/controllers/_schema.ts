import sage from "@dorkodu/sage-server";
import { NextFunction, Request, Response } from "express";

import auth from "./auth";

export interface SchemaContext {
  readonly req: Request;
  readonly res: Response;
  readonly next: NextFunction;

  triedAuth?: boolean;
  userId?: string;
}

export type Schema = typeof schema
export const schema = sage.schema(
  {} as SchemaContext,
  {
    /* auth */
    auth: auth.auth,
  }
)