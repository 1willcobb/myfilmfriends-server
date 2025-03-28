import express from "express";
import * as postController from "../controllers/postController.js";

const postRouter = express.Router();

//* GET: Retrieve all posts
postRouter.get("/", postController.getAllPosts);

//* GET: Retrieve user feed
postRouter.get("/feed/:userId", postController.getUserFeed);

//* POST: Create a new post
postRouter.post("/", postController.createPost);

//* GET: Retrieve posts for a specific user
postRouter.get("/user/:userId", postController.getUserPosts);

//* GET: Retrieve a post by ID
postRouter.get("/:postId", postController.getPostById);

//* PUT: Update a post
postRouter.put("/:postId", postController.updatePost);

//* DELETE: Delete a post
postRouter.delete("/:postId", postController.deletePost);

//* GET: Retrieve top posts for the current month
postRouter.get("/top/monthly", postController.getMonthlyTopPosts);

export default postRouter;
