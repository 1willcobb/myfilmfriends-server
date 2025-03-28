import express from "express";
import * as chatController from "../controllers/chatController.js";

const chatRouter = express.Router();

//* POST: Create a new chat
chatRouter.post("/", chatController.createChat);

//* GET: Retrieve a chat by ID
chatRouter.get("/:chatId", chatController.getChatById);

//* GET: Retrieve all chats for a user
chatRouter.get("/user/:userId", chatController.getUserChats);

//* POST: Check if a chat exists between participants
chatRouter.post("/check", chatController.checkChats);

//* POST: Get chat by participants
chatRouter.post("/participants", chatController.getChatByParticipants);

//* DELETE: Delete a chat
chatRouter.delete("/:chatId", chatController.deleteChat);

export default chatRouter;