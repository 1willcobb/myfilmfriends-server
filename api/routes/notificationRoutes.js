import express from 'express';
import * as notificationsController from '../controllers/notificationsController.js';

const notificationsRouter = express.Router();

//* POST: Create a new notification
notificationsRouter.post('/', notificationsController.createNotification);

//* GET: Retrieve notifications for a user
notificationsRouter.get('/:userId', notificationsController.getNotificationsByUser);

//* PATCH: Mark a notification as read
notificationsRouter.patch('/read/:notificationId', notificationsController.markNotificationAsRead);

//* DELETE: Delete a notification
notificationsRouter.delete('/:notificationId', notificationsController.deleteNotification);

//* DELETE: Delete all notifications for a user
notificationsRouter.delete('/all/:userId', notificationsController.deleteAllUserNotifications);

export default notificationsRouter;