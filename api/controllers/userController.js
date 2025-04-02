import prisma from "../../prisma/client.js";
import bcrypt from "bcryptjs";
import invariant from "tiny-invariant";

/**
 * Get user by ID
 */
export async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        profileImage: true,
        followerCount: true,
        followingCount: true,
        postCount: true,
        displayName: true,
        userBio: true,
        link: true,
        linkAltName: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        // password intentionally excluded
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * Get user by username
 */
export async function getUserByUsername(req, res) {
  try {
    const { username } = req.params;
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        profileImage: true,
        followerCount: true,
        followingCount: true,
        postCount: true,
        displayName: true,
        userBio: true,
        link: true,
        linkAltName: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user by username:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(req, res) {
  try {
    const { email } = req.params;
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        profileImage: true,
        followerCount: true,
        followingCount: true,
        postCount: true,
        displayName: true,
        userBio: true,
        link: true,
        linkAltName: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user by email:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * Get all users
 */
export async function getAllUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        profileImage: true,
        followerCount: true,
        followingCount: true,
        postCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * Create a new user
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The created user object
 */

export async function createUser(req, res) {
  try {
    const { email, username, name, password, role } = req.body;

    // Check if a user already exists with the given email or username
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        email,
        username,
        name: name || "",
        role: role || "FRIEND",
        password: {
          create: {
            hash: hashedPassword,
          },
        },
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * Update user profile
 */
export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;

    // Prevent updates to sensitive fields
    delete data.password;
    delete data.email; // Typically requires verification process

    const updatedUser = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        profileImage: true,
        followerCount: true,
        followingCount: true,
        postCount: true,
        displayName: true,
        userBio: true,
        link: true,
        linkAltName: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * Update user password
 */
export async function updateUserPassword(req, res) {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Find the user with password
    const user = await prisma.user.findUnique({
      where: { id },
      include: { password: true },
    });

    if (!user || !user.password) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.password.hash
    );
    if (!isValidPassword) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.password.update({
      where: { userId: id },
      data: { hash: hashedPassword },
    });

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating user password:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * Delete user by email (admin only function)
 */
export async function deleteUserByEmail(req, res) {
  try {
    const { email } = req.params;
    await prisma.user.delete({ where: { email } });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * Get user password reset tokens
 */
export async function getUserTokens(req, res) {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      include: { tokens: true },
    });

    invariant(user, "User not found");

    res.json(user.tokens);
  } catch (error) {
    console.error("Error fetching user tokens:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
