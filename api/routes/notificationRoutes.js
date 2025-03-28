import express from 'express';
import * as notificationController from '../controllers/notificationController.js';

const notificationRouter = express.Router();

//* POST: Create a new notification
notificationRouter.post('/', notificationController.createNotification);

//* GET: Retrieve notifications for a user
notificationRouter.get('/:userId', notificationController.getNotificationsByUser);

//* PATCH: Mark a notification as read
notificationRouter.patch('/read/:notificationId', notificationController.markNotificationAsRead);

//* DELETE: Delete a notification
notificationRouter.delete('/:notificationId', notificationController.deleteNotification);

//* DELETE: Delete all notifications for a user
notificationRouter.delete('/all/:userId', notificationController.deleteAllUserNotifications);

export default notificationRouter;