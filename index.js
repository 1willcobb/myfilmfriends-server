require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// // PostgreSQL Connection
// const pool = new Pool({
//   user: process.env.DB_USER || "postgres",
//   host: process.env.DB_HOST || "localhost",
//   database: process.env.DB_NAME || "mydatabase",
//   password: process.env.DB_PASSWORD || "postgres",
//   port: process.env.DB_PORT || 5432,
// });

// // Test Database Connection
// pool.connect()
//   .then(() => console.log("Connected to PostgreSQL"))
//   .catch((err) => console.error("Database connection error", err));

app.get("/", (req, res) => {
  res.send("Welcome to My Film Friends API");
}
);

// Get all users
app.get("/users", async (req, res) => {
  const users = await prisma.user.findMany({ include: { posts: true } });
  res.json(users);
});

// Create a new user
app.post("/users", async (req, res) => {
  const { name, email } = req.body;
  const user = await prisma.user.create({
    data: { name, email },
  });
  res.json(user);
});

// Get all posts
app.get("/posts", async (req, res) => {
  const posts = await prisma.post.findMany({ include: { user: true } });
  res.json(posts);
});


// Start Server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
