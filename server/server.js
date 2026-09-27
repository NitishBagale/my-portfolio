const express = require("express");
const cors = require("cors")
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
app.use(
  cors({
    origin:"https://nitishbagale.vercel.app",
  })
);

app.use(express.json());

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false,
        },
      }
    : {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD || undefined,
        port: process.env.DB_PORT,
      }
);

app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      message: "Database connected successfully",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error("Database error:", error.message);

    res.status(500).json({
      message: "Database connection failed",
      error: error.message,
    });
  }
});

app.post("/api/messages", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      message: "Name, email, and message are required",
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO messages (name, email, message)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, email, message]
    );

    res.status(201).json({
      message: "Message saved successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error saving message:", error.message);

    res.status(500).json({
      message: "Failed to save message",
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});