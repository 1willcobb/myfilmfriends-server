import prisma from "../../prisma/client.js";

// Create a new chat
export async function createChat(req, res) {
  const { participantIds } = req.body;

  try {
    const chat = await prisma.chat.create({
      data: {
        participants: {
          connect: participantIds.map((id) => ({ id })),
        },
      },
      include: {
        participants: true,
        messages: true,
      },
    });

    res.status(201).json(chat);
  } catch (error) {
    console.error("Error creating chat:", error);
    res.status(500).json({ error: "Failed to create chat." });
  }
}

// Get chat by ID
export async function getChatById(req, res) {
  const { chatId } = req.params;

  try {
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        participants: true,
        messages: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                profileImage: true,
              },
            },
          },
        },
      },
    });

    if (!chat) return res.status(404).json({ error: "Chat not found." });
    res.status(200).json(chat);
  } catch (error) {
    console.error("Error retrieving chat:", error);
    res.status(500).json({ error: "Failed to retrieve chat." });
  }
}

// Get user chats
export async function getUserChats(req, res) {
  const { userId } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        chats: {
          include: {
            participants: {
              select: {
                id: true,
                username: true,
                profileImage: true,
              },
            },
          },
        },
      },
    });

    if (!user) return res.status(404).json({ error: "User not found." });

    const userChats = user.chats
      .map((chat) => {
        const otherParticipants = chat.participants.filter((participant) => participant.id !== userId);
        return otherParticipants.map((participant) => ({
          chatId: chat.id,
          participantName: participant.username,
          participantId: participant.id,
          participantImage: participant.profileImage,
        }));
      })
      .flat();

    res.status(200).json(userChats);
  } catch (error) {
    console.error("Error retrieving user chats:", error);
    res.status(500).json({ error: "Failed to retrieve user chats." });
  }
}

// Check if a chat exists between participants
export async function checkChats(req, res) {
  const { participantIds } = req.body;

  try {
    const chat = await prisma.chat.findFirst({
      where: {
        participants: {
          every: {
            id: { in: participantIds },
          },
        },
      },
      include: {
        participants: true,
        messages: true,
      },
    });

    if (!chat) return res.status(404).json({ error: "Chat not found." });
    res.status(200).json(chat);
  } catch (error) {
    console.error("Error checking chat:", error);
    res.status(500).json({ error: "Failed to check chat." });
  }
}

// Get chat by participant IDs
export async function getChatByParticipants(req, res) {
  const { participantIds } = req.body;

  try {
    const chat = await prisma.chat.findFirst({
      where: {
        participants: {
          every: {
            id: { in: participantIds },
          },
        },
      },
      include: {
        participants: true,
        messages: true,
      },
    });

    if (!chat) return res.status(404).json({ error: "Chat not found." });
    res.status(200).json(chat);
  } catch (error) {
    console.error("Error retrieving chat by participants:", error);
    res.status(500).json({ error: "Failed to retrieve chat." });
  }
}

// Delete a chat
export async function deleteChat(req, res) {
  const { chatId } = req.params;

  try {
    const chat = await prisma.chat.delete({
      where: { id: chatId },
      include: {
        participants: true,
        messages: true,
      },
    });

    res.status(200).json({ message: "Chat deleted successfully", deletedChat: chat });
  } catch (error) {
    console.error("Error deleting chat:", error);
    res.status(500).json({ error: "Failed to delete chat." });
  }
}
