import prisma from "../../prisma/client.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Set your secret key for JWT (should ideally be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-key";
const TOKEN_EXPIRY = "7d"; // Token expires in 7 days

/**
 * User Login
 * Authenticates a user and creates a session
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    console.log("Attempting login for", email);

    // Find user with password relation
    const user = await prisma.user.findUnique({
      where: { email },
      include: { password: true }
    });

    if (!user || !user.password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare provided password with stored hash
    const isValidPassword = await bcrypt.compare(password, user.password.hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token (optional - can be used alongside or instead of sessions)
    const token = jwt.sign(
      { 
        userId: user.id, 
        role: user.role 
      }, 
      JWT_SECRET, 
      { expiresIn: TOKEN_EXPIRY }
    );

    // Create session
    req.session.regenerate((err) => {
      if (err) {
        console.error("Session regeneration error:", err);
        return res.status(500).json({ message: "Login failed" });
      }

      // Store user info in session
      req.session.userId = user.id;
      req.session.role = user.role;

      console.log("Session created:", req.session.id, "for user:", user.id);

      // Send response with user info and session ID
      res.status(200).json({
        message: "Login successful",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          role: user.role,
          profileImage: user.profileImage
        },
        sessionId: req.session.id,
        token // Include JWT if you want to use it
      });
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * User Signup
 * Creates a new user account
 */
export async function signup(req, res) {
  try {
    const { name, email, password, username } = req.body;

    // Validate required fields
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

    // Create user with password relationship
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

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        role: user.role 
      }, 
      JWT_SECRET, 
      { expiresIn: TOKEN_EXPIRY }
    );

    // Regenerate session and store user details
    req.session.regenerate((err) => {
      if (err) {
        console.error("Session error:", err);
        return res.status(500).json({ message: "Signup failed." });
      }

      req.session.userId = user.id;
      req.session.role = user.role;

      res.status(201).json({ 
        message: "Signup successful", 
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          role: user.role,
        },
        sessionId: req.session.id,
        token
      });
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

/**
 * User Logout
 * Destroys the user session
 */
export async function logout(req, res) {
  if (!req.session || !req.session.userId) {
    return res.status(200).json({ message: "Already logged out" });
  }
  
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Logout failed" });
    }
    
    res.clearCookie("connect.sid"); // Clear the session cookie
    res.status(200).json({ message: "Logout successful" });
  });
}

/**
 * Verify Token
 * Validates a JWT token and returns user information
 */
export async function verifyToken(req, res) {
  const token = req.headers.authorization?.split(" ")[1]; // Get token from Authorization header
  
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  
  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get the user from the database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        profileImage: true,
        // Don't include password hash!
      }
    });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json({ user });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    
    console.error("Token verification error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * Refresh Token
 * Issues a new token based on a valid existing token
 */
export async function refreshToken(req, res) {
  const token = req.headers.authorization?.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  
  try {
    // Verify the existing token
    const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true });
    
    // Check if the user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true }
    });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Generate a new token
    const newToken = jwt.sign(
      { userId: user.id, role: user.role }, 
      JWT_SECRET, 
      { expiresIn: TOKEN_EXPIRY }
    );
    
    res.status(200).json({ token: newToken });
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    
    console.error("Token refresh error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * Get Current User
 * Returns the currently authenticated user based on session
 */
export async function getCurrentUser(req, res) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        profileImage: true,
        // Don't include password hash!
      }
    });
    
    if (!user) {
      // Clear the session if user no longer exists
      req.session.destroy(() => {});
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}