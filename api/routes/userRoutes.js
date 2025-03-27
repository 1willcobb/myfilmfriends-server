import express from 'express';
import * as userController from '../controllers/userController.js';

const userRouter = express.Router();

//* Utils
userRouter.get('/verifyLogin', userController.verifyLogin);
userRouter.get('/verifyToken', userController.getUserTokens);

//* Posts
userRouter.post('', userController.createUser);

//* Gets
userRouter.get('', userController.getAllUsers);
userRouter.get('/:username', userController.getUserByUsername);
userRouter.get('/:id', userController.getUserById);
userRouter.get('/:email', userController.getUserByEmail);
userRouter.get('/:id/friends', userController.getUserByUsername);
userRouter.get(':id/friends/:friendId', );



//* Puts
userRouter.put('/:id', userController);


//* Deletes
userRouter.delete('/:email', userController.deleteUserByEmail);


export default userRouter;
