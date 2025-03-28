import express from "express";
import * as commentController from "../controllers/commentController.js";

const commentRouter = express.Router();

//* POST: Create a new comment
commentRouter.post("/", commentController.createComment);

//* GET: Retrieve comments for a post or blog
commentRouter.get("/", commentController.getCommentsByEntity);

//* PUT: Update a comment
commentRouter.put("/:commentId", commentController.updateComment);

//* DELETE: Delete a comment
commentRouter.delete("/:commentId", commentController.deleteComment);

export default commentRouter;