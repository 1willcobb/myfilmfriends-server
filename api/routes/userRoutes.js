import express from "express";
import * as userController from "../controllers/userController.js";

const userRouter = express.Router();

//* Utils
userRouter.post("/verifylogin", userController.verifyLogin);
userRouter.post("/verifytoken", userController.getUserTokens);

//* Posts
userRouter.post("/", userController.createUser);

//* Gets
userRouter.get("/", userController.getAllUsers);
userRouter.get("/username/:username", userController.getUserByUsername);
userRouter.get("/id/:id", userController.getUserById);
userRouter.get("/email/:email", userController.getUserByEmail);

//* Puts
userRouter.put("/id/:id", userController.updateUser);

//* Deletes
userRouter.delete("/email/:email", userController.deleteUserByEmail);

export default userRouter;
