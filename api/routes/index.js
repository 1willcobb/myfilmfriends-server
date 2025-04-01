import express from 'express';
import userRouter from './userRoutes.js';
import voteRouter from './voteRoutes.js';
import userFollowRouter from './userFollowRoutes.js';
import blogRouter from './blogRoutes.js';
import likeRouter from './likeRouter.js';
import passwordRouter from './passwordRoutes.js';
import notificationRouter from './notificationRoutes.js';
// import messageRouter from './messageRoutes.js';
import commentRouter from './commentRoutes.js';
import chatRouter from './chatRoutes.js';
import postRouter from './postRoutes.js';
import authRouter from './authRoutes.js';
import { requireAuth } from '../../middleware/requireAuth.js';

const router = express.Router();

router.get('/', (req, res) => {

  console.log('GET /api');
  res.status(200).send('API Access working');
});

router.use('/user', userRouter);
router.use('/vote', voteRouter);
router.use('/userFollow', userFollowRouter);
router.use('/blog', blogRouter);
router.use('/like', likeRouter);
router.use('/password', passwordRouter);
router.use('/notification', notificationRouter);
// router.use('/message', messageRouter);
router.use('/comment', commentRouter);
router.use('/chat', chatRouter);
router.use('/post', postRouter);
router.use('/auth', authRouter);

router.get("*", (req, res) => {
  // This will catch any undefined routes and return a 404
  console.log('404 - Route not found');
  res.status(404).send('Route not found');
});

export default router