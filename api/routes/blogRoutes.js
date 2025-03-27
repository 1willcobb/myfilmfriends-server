import express from "express";
import * as blogController from "../controllers/blogController.js";

const blogRouter = express.Router();

//* Posts
blogRouter.post("/", blogController.createBlog);

//* Gets
blogRouter.get("/", blogController.getBlogs);
blogRouter.get("/:blogId", blogController.getBlogById);

//* Puts (Update)
blogRouter.put("/:blogId", blogController.updateBlog);

//* Deletes
blogRouter.delete("/:blogId", blogController.deleteBlog);

export default blogRouter;
