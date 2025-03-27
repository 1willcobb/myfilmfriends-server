import invariant from 'tiny-invariant';
import { v4 as uuidv4 } from "uuid"; //!FIX THIS
import bcrypt from 'bcryptjs';
import prisma from "../../prisma/client.js";
import { getUserByEmail } from "./userController.js";

// Request Password Reset
export async function requestPasswordReset(req, res) {
  const { email } = req.body;

  try {
    // Check if the user exists
    const userByEmail = await getUserByEmail(email);
    invariant(userByEmail, 'User by email not found');
  
    console.log('userByEmail', userByEmail);
  
    const userId = userByEmail.id;
    const token = await createPasswordResetToken(userId);
  
    return res.status(200).json({ message: 'Password reset requested successfully', token });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

// Create Password Reset Token
export async function createPasswordResetToken(userId) {
  const token = uuidv4(); // Generate a unique token

  const expiration = new Date();
  expiration.setHours(expiration.getHours() + 1); // Token expires in 1 hour

  const passwordResetToken = await prisma.passwordResetToken.create({
    data: {
      token: token,
      userId: userId,
      expiration: expiration,
    },
  });

  return passwordResetToken.token;
}

// Get Password Reset Token
export async function getPasswordResetToken(req, res) {
  const { token } = req.params;

  try {
    const result = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!result || new Date(result.expiration) < new Date()) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

// Reset Password
export async function resetPassword(req, res) {
  const { token, newPassword } = req.body;

  try {
    console.log("resetPassword model");

    // Retrieve the reset token from the database using Prisma
    const result = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    // Check if the token exists and is not expired
    if (!result || new Date(result.expiration) < new Date()) {
      return res.status(400).json({ message: "Invalid or expired password reset token" });
    }

    const userId = result.userId;
    if (!userId) {
      return res.status(400).json({ message: "User ID is missing in the reset token" });
    }

    console.log(`Resetting password for user ${userId}`);

    // Hash the new password using bcrypt
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database using Prisma
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: {
          update: {
            hash: hashedPassword,
          },
        },
      },
    });

    // Delete the reset token from the database using Prisma
    await prisma.passwordResetToken.delete({
      where: { token },
    });

    console.log(`Password updated for user ${userId}`);
    return res.status(200).json({ message: "Password successfully updated" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}
