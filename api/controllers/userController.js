import prisma from "../../prisma/client.js";
import bcrypt from "bcryptjs";
import invariant from "tiny-invariant";

export async function getUserById(req, res) {
  console.log("getUserById - before query");
  const { id } = req.params;
  console.log("getUserById - id", id);
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });

    console.log("getUserById - user", user);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function getUserByUsername(req, res) {
  try {
    const { username } = req.params;
    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user by username:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function getUserByEmail(req, res) {
  try {
    const { email } = req.params;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user by email:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function createUser(req, res) {
  try {
    const { email, username, password } = req.body;

    // Check if a user already exists with the given email or username
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return res.status(400).json({ error: "User Exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        email,
        username,
        password: {
          create: {
            hash: hashedPassword,
          },
        },
      },
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

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

export async function getAllUsers(req, res) {
  try {
    console.log("getAllUsers - before query");
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "asc" },
    });

    console.log("getAllUsers - after query", users.length);
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;

    const updatedUser = await prisma.user.update({
      where: { id },
      data,
    });

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function getUserTokens(req, res) {
  try {
    const { id } = req.params;
    const updatedUser = await prisma.user.findUnique({
      where: { id },
      include: { tokens: true },
    });

    invariant(updatedUser, "User not found");

    res.json(updatedUser.tokens);
  } catch (error) {
    console.error("Error fetching user tokens:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function verifyLogin(req, res) {
  try {
    const { userOrEmail, password } = req.body;
    let user;

    if (userOrEmail.includes("@")) {
      user = await getUserByEmail({ params: { email: userOrEmail } });
    } else {
      user = await getUserByUsername({ params: { username: userOrEmail } });
    }

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const userPassword = await getUserPasswordById(user.id);
    if (!userPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, userPassword.hash);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({ message: "Login successful", user });
  } catch (error) {
    console.error("Error verifying login:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
