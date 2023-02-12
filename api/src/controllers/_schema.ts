import sage from "@dorkodu/sage-server";
import { NextFunction, Request, Response } from "express";

import auth from "./auth";
import user from "./user";
import discussion from "./discussion";

export interface SchemaContext {
  readonly req: Request;
  readonly res: Response;
  readonly next: NextFunction;

  shared: {
    triedAuth?: boolean;
    userId?: string;
  }

  userIds?: Set<string>;
  userId?: string;
  discussionIds?: Set<string>;
  argumentIds?: Set<string>;
  commentIds?: Set<string>;
}

export type Schema = typeof schema
export const schema = sage.schema(
  {} as SchemaContext,
  {
    /* auth */
    auth: auth.auth,
    logout: auth.logout,
    getAccessToken: auth.getAccessToken,

    /* user */
    getUser: user.getUser,
    searchUser: user.searchUser,

    followUser: user.followUser,
    blockUser: user.blockUser,

    getUserDiscussions: user.getUserDiscussions,
    getUserFollowers: user.getUserFollowers,
    getUserFollowing: user.getUserFollowing,

    /* discussion */
    createDiscussion: discussion.createDiscussion,
    deleteDiscussion: discussion.deleteDiscussion,
    getDiscussion: discussion.getDiscussion,
    editDiscussion: discussion.editDiscussion,
    searchDiscussion: discussion.searchDiscussion,

    favouriteDiscussion: discussion.favouriteDiscussion,

    getUserDiscussionFeed: discussion.getUserDiscussionFeed,
    getFavouriteDiscussionFeed: discussion.getFavouriteDiscussionFeed,
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