import prisma from "../../prisma/client.js";

// Create a new notification
export async function createNotification(req, res) {
  const { userId, content, link } = req.body;

  try {
    const notification = await prisma.notification.create({
      data: {
        user: { connect: { id: userId } },
        content,
        link,
      },
      include: { user: true },
    });
    res.status(201).json(notification);
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ error: "Failed to create notification." });
  }
}

// Retrieve notifications for a user (with pagination support)
export async function getNotificationsByUser(req, res) {
  const { userId } = req.params;
  const { page = 1, pageSize = 100 } = req.query;
  const skip = (page - 1) * pageSize;

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: parseInt(pageSize),
    });
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error retrieving notifications:", error);
    res.status(500).json({ error: "Failed to retrieve notifications." });
  }
}

// Mark notifications as read
export async function markNotificationAsRead(req, res) {
  const { notificationId } = req.params;

  try {
    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
      include: { user: true },
    });
    res.status(200).json(notification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: "Failed to mark notification as read." });
  }
}

// Delete a notification
export async function deleteNotification(req, res) {
  const { notificationId } = req.params;

  try {
    const notification = await prisma.notification.delete({
      where: { id: notificationId },
      include: { user: true },
    });
    res.status(200).json(notification);
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ error: "Failed to delete notification." });
  }
}

// Delete all notifications for a user
export async function deleteAllUserNotifications(req, res) {
  const { userId } = req.params;

  try {
    await prisma.notification.deleteMany({
      where: { userId },
    });
    res.status(200).json({ message: "All notifications deleted." });
  } catch (error) {
    console.error("Error deleting all notifications:", error);
    res.status(500).json({ error: "Failed to delete notifications." });
  }
}
