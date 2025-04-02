import express from "express";
import * as authController from "../controllers/authController.js";

const authRouter = express.Router();

// Authentication routes
authRouter.post("/login", authController.login);
authRouter.post("/signup", authController.signup);
authRouter.post("/logout", authController.logout);
authRouter.get("/verify", authController.verifyToken);
authRouter.post("/refresh", authController.refreshToken);
authRouter.get("/me", authController.getCurrentUser);

export default authRouter;
