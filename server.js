import "dotenv/config";
import express from "express";
import cors from "cors";
import pkg from "pg";
const { Pool } = pkg;
import prisma from "./prisma/client.js";
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';

import router from "./api/routes/index.js";

const app = express();
app.use(cookieParser());
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

app.use(
  session({
    // Secret used to sign the session ID cookie. Use a long, random string stored in env variables!
    secret: process.env.SESSION_SECRET || 'fallback-super-secret-key', // CHANGE THIS!
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create session until something stored
    store: new PrismaSessionStore(prisma, {
      // Configuration for the Prisma Session Store
      checkPeriod: 2 * 60 * 1000, // Check for expired sessions every 2 minutes
      dbRecordIdIsSessionId: true, // Use Prisma Record ID as Session ID (recommended)
      dbRecordIdFunction: undefined, // Optional: function to customize session ID generation
    }),
    cookie: {
      // secure: process.env.NODE_ENV === 'production', // Use true in production (requires HTTPS)
      secure: false, // Set to false for local HTTP testing (like with React Native simulator)
      httpOnly: true, // Prevents client-side JS accessing the cookie (important security)
      maxAge: 1000 * 60 * 60 * 24 * 7, // Session duration: 7 days in milliseconds
      // sameSite: 'lax', // Or 'strict'. Helps protect against CSRF. Consider implications for RN.
                         // 'lax' is often a reasonable default.
    },
  })
);

// PostgreSQL Connection
const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "mydatabase",
  password: process.env.DB_PASSWORD || "postgres",
  port: process.env.DB_PORT || 5432,
  connectionString: process.env.DATABASE_URL,
});

// Test Database Connection
pool
  .connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch((err) => console.error("Database connection error", err));

app.get("/", (req, res) => {
  res.status(200).send("Welcome to My Film Friends API");
});

router.get("*", (req, res) => {
  // This will catch any undefined routes and return a 404
  console.log("404 - Route not found");
  res.status(404).send("Route not found");
});

app.use("/api", router);

// Start Server
app.listen(port, () => {
  console.log(`Server is running on post ${port}`);
});
