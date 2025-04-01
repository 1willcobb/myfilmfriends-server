import express from "express";
import * as authController from "../controllers/authController.js";

const authRouter = express.Router();


//* Posts
authRouter.post("/login", authController.login);
authRouter.post("/logout", authController.logout);
authRouter.post("/signup", authController.signup);

export default authRouter;
