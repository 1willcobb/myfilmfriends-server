// import prisma from "../../prisma/client.js";
// import { createNotification } from "./notificationController.js";
// import { getUserById } from "./userController.js";
// // import { io } from "../../server";

// // Create a new message
// export async function createMessage(req, res) {
//   const { content, userId, chatId } = req.body;

//   try {
//     const message = await prisma.message.create({
//       data: {
//         content,
//         userId,
//         chatId,
//       },
//     });

//     const chat = await prisma.chat.findUnique({
//       where: { id: chatId },
//       include: { participants: true },
//     });

//     if (!chat) {
//       return res.status(404).json({ error: "Chat not found" });
//     }

//     console.log("Message created:", message);

//     const user = await getUserById(userId);

//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     const formattedMessage = {
//       ...message,
//       user: {
//         id: user.id,
//         username: user.username,
//         profileImage: user.profileImage,
//       },
//     };

//     // Notify all participants except the sender
//     const recipients = chat.participants.filter(participant => participant.id !== userId);

//     await Promise.all(
//       recipients.map(recipient =>
//         createNotification({
//           userId: recipient.id,
//           content: `New message from ${user.username} stating: ${content}`,
//           link: `/me/${recipient.id}/chats/${chatId}`,
//         })
//       )
//     );

//     // Emit the message event to recipients
//     recipients.forEach(recipient => {
//       console.log("***Emitting message to user:", recipient.id);
//       io.emit("note", {
//         userId: recipient.id,
//         content: `New message from ${user.username} stating: ${content}`,
//         chatId,
//       });
//       console.log("!!!!after emit", chatId);
//     });

//     res.status(201).json(formattedMessage);
//   } catch (error) {
//     console.error("Error creating message:", error);
//     res.status(500).json({ error: "Failed to create message." });
//   }
// }

// // Retrieve messages for a chat with pagination
// export async function getMessagesByChat(req, res) {
//   const { chatId } = req.params;
//   const { page = 1, pageSize = 10 } = req.query;
//   const skip = (page - 1) * pageSize;

//   try {
//     const messages = await prisma.message.findMany({
//       where: { chatId },
//       include: {
//         user: true,
//         chat: true,
//       },
//       orderBy: { createdAt: "asc" },
//       skip,
//       take: parseInt(pageSize),
//     });

//     res.status(200).json(messages);
//   } catch (error) {
//     console.error("Error retrieving messages:", error);
//     res.status(500).json({ error: "Failed to retrieve messages." });
//   }
// }

// // Delete a message
// export async function deleteMessage(req, res) {
//   const { messageId } = req.params;

//   try {
//     const message = await prisma.message.delete({
//       where: { id: messageId },
//       include: {
//         user: true,
//         chat: true,
//       },
//     });

//     res.status(200).json({ message: "Message deleted successfully", deletedMessage: message });
//   } catch (error) {
//     console.error("Error deleting message:", error);
//     res.status(500).json({ error: "Failed to delete message." });
//   }
// }
