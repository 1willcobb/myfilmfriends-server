// File: ./middleware/requireAuth.js (Example location)

// Make sure PrismaClient is imported and initialized
// (You'll set this up when configuring your server)
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient(); // Adjust initialization as needed

/**
 * Express Middleware to check if a user is authenticated via session.
 * --- THIS REQUIRES express-session and login logic to be set up first ---
 *
 * If authenticated (req.session.userId exists and user is found in DB),
 * attaches user data (excluding sensitive info) to req.user and calls next().
 * If not authenticated, sends a 401 Unauthorized response.
 */
export const requireAuth = async (req, res, next) => {
  console.debug('Auth Check - Session Object:', req.session); // Log the whole session object for debugging
  const userId = req.session?.userId; // Attempt to get userId from the session

  if (!userId) {
    // No userId found in the session. This happens if:
    // 1. express-session isn't running correctly.
    // 2. The user never logged in successfully.
    // 3. The session expired and was cleared.
    console.log('requireAuth: FAILED - No userId found in session.');
    return res.status(401).json({ message: 'Unauthorized: Please log in.' });
  }

  // --- Optional but Recommended: Verify user exists in DB ---
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { // Select only necessary, non-sensitive fields
        id: true, email: true, username: true, role: true, isAdmin: true,
        // DO NOT select password hash
      },
    });

    if (!user) {
      // userId was in session, but user no longer exists in DB. Session is invalid.
      console.log(`requireAuth: FAILED - User ${userId} from session not found in DB.`);
      req.session.destroy((err) => { // Clean up the invalid session
        if (err) console.error('Error destroying invalid session:', err);
        res.clearCookie('connect.sid'); // Ensure cookie (if used) is cleared
        return res.status(401).json({ message: 'Unauthorized: Invalid session user.' });
      });
      return; // Stop execution
    }

    // --- Authentication Success ---
    console.log(`requireAuth: SUCCESS - User ${user.username} (${user.id}) authenticated.`);
    req.user = user; // Attach user data to the request object
    next(); // Proceed to the protected route handler

  } catch (error) {
    console.error('requireAuth: Database error during user verification:', error);
    res.status(500).json({ message: 'Internal server error during authentication.' });
  }
};