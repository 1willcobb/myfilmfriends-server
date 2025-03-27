import express from "express";
import * as voteController from "../controllers/voteController.js";

const voteRouter = express.Router();

//* Posts
voteRouter.post("/", voteController.createVote);

//* Gets
voteRouter.get("/post/:postId", voteController.getVotesByPost);

//* Deletes
voteRouter.delete("/", voteController.deleteVote);

//* Check if user has voted
voteRouter.get("/hasVoted", voteController.hasUserVoted);

export default voteRouter;
