import prisma from "../../prisma/client.js";
import bcrypt from "bcrypt";

//* User Login
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    console.log("Attempting login for", email, password);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // console.log("User found:", user);

    if (!user || !password) {
      return res.status(401).json({ message: "No user found" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log("Password comparison result:", isValidPassword);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    req.session.regenerate((err) => {
      if (err) {
        console.error("Session regeneration error:", err);
        return res.status(500).json({ message: "Login failed" });
      }

      req.session.userId = user.id;
      req.session.role = user.role;

      console.log("Session created:", req.session.id, "for user:", user.id);

      res.status(200).json({
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
        },
        sessionId: req.session.id,
      });
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function signup(req, res) {
  try {
    const { name, email, password, username } = req.body;

    if (!name || !email || !password || !username) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if email or username already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email or username already in use." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        username,
        password: {
          create: { hash: hashedPassword },
        },
      },
    });

    // Regenerate session and store user details
    req.session.regenerate((err) => {
      if (err) {
        console.error("Session error:", err);
        return res.status(500).json({ message: "Signup failed." });
      }

      req.session.userId = user.id;
      req.session.role = user.role;

      res.status(201).json({ message: "Signup successful", user });
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

//* User Logout
export async function logout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Logout failed" });
    }
    res.clearCookie("connect.sid");
    res.status(200).json({ message: "Logout successful" });
  });
}