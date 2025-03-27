import express from "express";
import * as likeController from "../controllers/likeController.js";

const likeRouter = express.Router();

//* Posts
likeRouter.post("/", likeController.createLike);

//* Gets
likeRouter.get("/", likeController.getLikesByEntity);
likeRouter.get("/:likeId", likeController.getLikeById);
likeRouter.get("/hasUserLiked", likeController.hasUserLiked);

//* Deletes
likeRouter.delete("/:userId/:postId?/:commentId?/:blogId?", likeController.deleteLike);

export default likeRouter;
