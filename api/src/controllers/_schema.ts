import sage from "@dorkodu/sage-server";
import { NextFunction, Request, Response } from "express";

import auth from "./auth";
import user from "./user";
import discussion from "./discussion";

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
    getAccessToken: auth.getAccessToken,

    /* user */
    getUser: user.getUser,
    editUser: user.editUser,
    searchUser: user.searchUser,

    getUserDiscussions: user.getUserDiscussions,

    followUser: user.followUser,
    getUserFollowers: user.getUserFollowers,
    getUserFollowing: user.getUserFollowing,

    /* discussion */
    createDiscussion: discussion.createDiscussion,
    deleteDiscussion: discussion.deleteDiscussion,
    editDiscussion: discussion.editDiscussion,
    searchDiscussion: discussion.searchDiscussion,

    favouriteDiscussion: discussion.favouriteDiscussion,

    getUserDiscussionFeed: discussion.getUserDiscussionFeed,
    getGuestDiscussionFeed: discussion.getGuestDiscussionFeed,

    createComment: discussion.createComment,
    deleteComment: discussion.deleteComment,
    getComments: discussion.getComments,

    createArgument: discussion.createArgument,
    deleteArgument: discussion.deleteArgument,
    getArguments: discussion.getArguments,
    voteArgument: discussion.voteArgument,
  }
)