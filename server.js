import "dotenv/config";
import express from "express";
import cors from "cors";
import pkg from "pg";
const { Pool } = pkg;
import { PrismaClient } from "@prisma/client";
import router from "./api/routes/index.js";

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

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

app.use("/api", router);

// Start Server
app.listen(port, () => {
  console.log(`Server is running on post ${port}`);
});
