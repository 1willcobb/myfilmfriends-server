import express from 'express';
import * as passwordController from '../controllers/passwordController.js';

const passwordRouter = express.Router();

//* POST: Request password reset
passwordRouter.post('/request-password-reset', passwordController.requestPasswordReset);

//* GET: Get password reset token
passwordRouter.get('/reset-token/:token', passwordController.getPasswordResetToken);

//* POST: Reset password
passwordRouter.post('/reset-password', passwordController.resetPassword);

export default passwordRouter;