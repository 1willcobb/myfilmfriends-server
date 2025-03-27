import express from 'express';
import * as userController from '../controllers/userController.js';

const router = express.Router();

router.get('/users', userController.getUsers);
router.post('/users', userController.createUser);

// Other routes for update, delete, etc.

export default router;
