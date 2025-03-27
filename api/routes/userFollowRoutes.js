import express from "express";
import * as userFollowController from "../controllers/userFollowController.js";

const userFollowRouter = express.Router();

//* Posts
userFollowRouter.post("/", userFollowController.followUser);

//* Gets
userFollowRouter.get("/followers/:userId", userFollowController.getFollowers);
userFollowRouter.get("/following/:userId", userFollowController.getFollowing);

//* Deletes
userFollowRouter.delete("/unfollow/:followerId/:followedId", userFollowController.unfollowUser);

export default userFollowRouter;
