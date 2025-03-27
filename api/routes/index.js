import express from 'express';
import userRouter from './userRoutes.js';
import voteRouter from './voteRoutes.js';
import userFollowRouter from './userFollowRoutes.js';
import blogRouter from './blogRoutes.js';
import likeRouter from './likeRouter.js';
import passwordRouter from './passwordRoutes.js';
import notificationsRouter from './notificationRoutes.js';

const router = express.Router();

router.get('/', (req, res) => {
  console.log('GET /api');
  res.status(200).send('API Access working');
});

router.use('/users', userRouter);
router.use('/votes', voteRouter);
router.use('/userFollow', userFollowRouter);
router.use('/blog', blogRouter);
router.use('/like', likeRouter);
router.use('/password', passwordRouter);
router.use('/notifications', notificationsRouter);

export default router