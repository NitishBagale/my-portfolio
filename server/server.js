const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://nitishbagale.vercel.app",
    ],
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

/* =========================
   ADMIN AUTHENTICATION
========================= */

const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Access token required",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
    if (error) {
      return res.status(403).json({
        message: "Invalid or expired token",
      });
    }

    if (!user.isAdmin) {
      return res.status(403).json({
        message: "Admin access required",
      });
    }

    req.user = user;
    next();
  });
};

/* =========================
   BASIC ROUTES
========================= */

app.get("/", (req, res) => {
  res.json({
    message: "Server is running",
  });
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

/* =========================
   CONTACT MESSAGES
========================= */

app.get("/api/messages", authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM messages ORDER BY created_at DESC"
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching messages:", error.message);

    res.status(500).json({
      message: "Failed to fetch messages",
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
    });
  }
});

/* =========================
   REGISTER
========================= */

app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Name, email, and password are required",
    });
  }

  try {
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: "User with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [name, email, hashedPassword]
    );

    res.status(201).json({
      message: "User registered successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Registration error:", error.message);

    res.status(500).json({
      message: "Registration failed",
    });
  }
});

/* =========================
   LOGIN
========================= */

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        isAdmin: user.is_admin,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.is_admin,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    res.status(500).json({
      message: "Login failed",
    });
  }
});

/* =========================
   PUBLIC WEBSITE CONTENT
========================= */

/* =========================
   PUBLIC HERO CONTENT
========================= */

app.get("/api/content/hero", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT content FROM site_content WHERE section = 'hero'"
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Hero content not found",
      });
    }

    res.json(result.rows[0].content);
  } catch (error) {
    console.error("Error fetching hero content:", error.message);

    res.status(500).json({
      message: "Failed to fetch hero content",
    });
  }
});

/* =========================
   PUBLIC ABOUT CONTENT
========================= */

app.get("/api/content/about", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT content FROM site_content WHERE section = 'about'"
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "About content not found",
      });
    }

    res.json(result.rows[0].content);
  } catch (error) {
    console.error("Error fetching about content:", error.message);

    res.status(500).json({
      message: "Failed to fetch about content",
    });
  }
});

/* =========================
   PUBLIC SKILLS CONTENT
========================= */

app.get("/api/content/skills", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT content FROM site_content WHERE section = 'skills'"
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Skills content not found",
      });
    }

    res.json(result.rows[0].content);
  } catch (error) {
    console.error("Error fetching skills content:", error.message);

    res.status(500).json({
      message: "Failed to fetch skills content",
    });
  }
});

/* =========================
   PUBLIC CONTACT CONTENT
========================= */

app.get("/api/content/contact", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT content FROM site_content WHERE section = 'contact'"
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Contact content not found",
      });
    }

    res.json(result.rows[0].content);
  } catch (error) {
    console.error("Error fetching contact content:", error.message);

    res.status(500).json({
      message: "Failed to fetch contact content",
    });
  }
});

/* =========================
   PUBLIC PROJECTS
========================= */

app.get("/api/projects", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM projects
       WHERE is_published = true
       ORDER BY id ASC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching projects:", error.message);

    res.status(500).json({
      message: "Failed to fetch projects",
    });
  }
});

/* =========================
   ADMIN WEBSITE CONTENT
========================= */

/* =========================
   ADMIN HERO CONTENT
========================= */

app.get(
  "/api/admin/content/hero",
  authenticateAdmin,
  async (req, res) => {
    try {
      const result = await pool.query(
        "SELECT content FROM site_content WHERE section = 'hero'"
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Hero content not found",
        });
      }

      res.json(result.rows[0].content);
    } catch (error) {
      console.error(
        "Error fetching admin hero content:",
        error.message
      );

      res.status(500).json({
        message: "Failed to fetch hero content",
      });
    }
  }
);

app.put(
  "/api/admin/content/hero",
  authenticateAdmin,
  async (req, res) => {
    const {
      title,
      description,
      buttonText,
      buttonUrl,
      image,
    } = req.body;

    if (
      !title ||
      !description ||
      !buttonText ||
      !buttonUrl ||
      !image
    ) {
      return res.status(400).json({
        message: "All hero fields are required",
      });
    }

    try {
      const result = await pool.query(
        `UPDATE site_content
         SET content = $1::jsonb,
             updated_at = CURRENT_TIMESTAMP
         WHERE section = 'hero'
         RETURNING content`,
        [
          JSON.stringify({
            title,
            description,
            buttonText,
            buttonUrl,
            image,
          }),
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Hero content not found",
        });
      }

      res.json({
        message: "Hero content updated successfully",
        content: result.rows[0].content,
      });
    } catch (error) {
      console.error(
        "Error updating Hero content:",
        error.message
      );

      res.status(500).json({
        message: "Failed to update hero content",
      });
    }
  }
);

/* =========================
   ADMIN ABOUT CONTENT
========================= */

app.get(
  "/api/admin/content/about",
  authenticateAdmin,
  async (req, res) => {
    try {
      const result = await pool.query(
        "SELECT content FROM site_content WHERE section = 'about'"
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "About content not found",
        });
      }

      res.json(result.rows[0].content);
    } catch (error) {
      console.error(
        "Error fetching admin about content:",
        error.message
      );

      res.status(500).json({
        message: "Failed to fetch about content",
      });
    }
  }
);

app.put(
  "/api/admin/content/about",
  authenticateAdmin,
  async (req, res) => {
    const {
      topLabel,
      heading,
      description,
      buttonText,
      buttonUrl,
      cards,
    } = req.body;

    if (
      !topLabel ||
      !heading ||
      !description ||
      !buttonText ||
      !buttonUrl ||
      !Array.isArray(cards)
    ) {
      return res.status(400).json({
        message: "All About fields are required",
      });
    }

    try {
      const result = await pool.query(
        `UPDATE site_content
         SET content = $1::jsonb,
             updated_at = CURRENT_TIMESTAMP
         WHERE section = 'about'
         RETURNING content`,
        [
          JSON.stringify({
            topLabel,
            heading,
            description,
            buttonText,
            buttonUrl,
            cards,
          }),
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "About content not found",
        });
      }

      res.json({
        message: "About content updated successfully",
        content: result.rows[0].content,
      });
    } catch (error) {
      console.error(
        "Error updating About content:",
        error.message
      );

      res.status(500).json({
        message: "Failed to update About content",
      });
    }
  }
);

/* =========================
   ADMIN SKILLS CONTENT
========================= */

app.get(
  "/api/admin/content/skills",
  authenticateAdmin,
  async (req, res) => {
    try {
      const result = await pool.query(
        "SELECT content FROM site_content WHERE section = 'skills'"
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Skills content not found",
        });
      }

      res.json(result.rows[0].content);
    } catch (error) {
      console.error(
        "Error fetching admin skills content:",
        error.message
      );

      res.status(500).json({
        message: "Failed to fetch skills content",
      });
    }
  }
);

app.put(
  "/api/admin/content/skills",
  authenticateAdmin,
  async (req, res) => {
    const {
      topLabel,
      kicker,
      heading,
      description,
      learningText,
      groups,
    } = req.body;

    if (
      !topLabel ||
      !kicker ||
      !heading ||
      !description ||
      !learningText ||
      !Array.isArray(groups)
    ) {
      return res.status(400).json({
        message: "All Skills fields are required",
      });
    }

    try {
      const result = await pool.query(
        `UPDATE site_content
         SET content = $1::jsonb,
             updated_at = CURRENT_TIMESTAMP
         WHERE section = 'skills'
         RETURNING content`,
        [
          JSON.stringify({
            topLabel,
            kicker,
            heading,
            description,
            learningText,
            groups,
          }),
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Skills content not found",
        });
      }

      res.json({
        message: "Skills content updated successfully",
        content: result.rows[0].content,
      });
    } catch (error) {
      console.error(
        "Error updating Skills content:",
        error.message
      );

      res.status(500).json({
        message: "Failed to update Skills content",
      });
    }
  }
);

/* =========================
   ADMIN CONTACT CONTENT
========================= */

app.get(
  "/api/admin/content/contact",
  authenticateAdmin,
  async (req, res) => {
    try {
      const result = await pool.query(
        "SELECT content FROM site_content WHERE section = 'contact'"
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Contact content not found",
        });
      }

      res.json(result.rows[0].content);
    } catch (error) {
      console.error(
        "Error fetching admin contact content:",
        error.message
      );

      res.status(500).json({
        message: "Failed to fetch contact content",
      });
    }
  }
);

app.put(
  "/api/admin/content/contact",
  authenticateAdmin,
  async (req, res) => {
    const {
      topLabel,
      heading,
      badge,
      mainTitle,
      mainTitleAccent,
      description,
      noteTitle,
      noteDescription,
      signature,
      signatureAccent,
      formLabel,
      formTitle,
      nameLabel,
      namePlaceholder,
      emailLabel,
      emailPlaceholder,
      messageLabel,
      messagePlaceholder,
      submitText,
      formHint,
    } = req.body;

    if (
      !topLabel ||
      !heading ||
      !badge ||
      !mainTitle ||
      !mainTitleAccent ||
      !description ||
      !noteTitle ||
      !noteDescription ||
      !signature ||
      !signatureAccent ||
      !formLabel ||
      !formTitle ||
      !nameLabel ||
      !namePlaceholder ||
      !emailLabel ||
      !emailPlaceholder ||
      !messageLabel ||
      !messagePlaceholder ||
      !submitText ||
      !formHint
    ) {
      return res.status(400).json({
        message: "All Contact fields are required",
      });
    }

    try {
      const result = await pool.query(
        `UPDATE site_content
         SET content = $1::jsonb,
             updated_at = CURRENT_TIMESTAMP
         WHERE section = 'contact'
         RETURNING content`,
        [
          JSON.stringify({
            topLabel,
            heading,
            badge,
            mainTitle,
            mainTitleAccent,
            description,
            noteTitle,
            noteDescription,
            signature,
            signatureAccent,
            formLabel,
            formTitle,
            nameLabel,
            namePlaceholder,
            emailLabel,
            emailPlaceholder,
            messageLabel,
            messagePlaceholder,
            submitText,
            formHint,
          }),
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Contact content not found",
        });
      }

      res.json({
        message: "Contact content updated successfully",
        content: result.rows[0].content,
      });
    } catch (error) {
      console.error(
        "Error updating Contact content:",
        error.message
      );

      res.status(500).json({
        message: "Failed to update Contact content",
      });
    }
  }
);

/* =========================
   ADMIN PROJECTS
========================= */

app.get(
  "/api/admin/projects",
  authenticateAdmin,
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT *
         FROM projects
         ORDER BY id ASC`
      );

      res.json(result.rows);
    } catch (error) {
      console.error(
        "Error fetching admin projects:",
        error.message
      );

      res.status(500).json({
        message: "Failed to fetch projects",
      });
    }
  }
);

/* =========================
   ADD PROJECT
========================= */

app.post(
  "/api/admin/projects",
  authenticateAdmin,
  async (req, res) => {
    const {
      number,
      name,
      type,
      image,
      description,
      technologies,
      url,
      isPublished,
    } = req.body;

    if (
      !number ||
      !name ||
      !type ||
      !image ||
      !description ||
      !Array.isArray(technologies) ||
      !url
    ) {
      return res.status(400).json({
        message: "All project fields are required",
      });
    }

    try {
      const result = await pool.query(
        `INSERT INTO projects
        (
          number,
          name,
          type,
          image,
          description,
          technologies,
          url,
          is_published
        )
        VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8)
        RETURNING *`,
        [
          number,
          name,
          type,
          image,
          description,
          JSON.stringify(technologies),
          url,
          isPublished ?? true,
        ]
      );

      res.status(201).json({
        message: "Project added successfully",
        project: result.rows[0],
      });
    } catch (error) {
      console.error("Error adding project:", error.message);

      res.status(500).json({
        message: "Failed to add project",
      });
    }
  }
);

/* =========================
   UPDATE PROJECT
========================= */

app.put(
  "/api/admin/projects/:id",
  authenticateAdmin,
  async (req, res) => {
    const { id } = req.params;

    const {
      number,
      name,
      type,
      image,
      description,
      technologies,
      url,
      isPublished,
    } = req.body;

    if (
      !number ||
      !name ||
      !type ||
      !image ||
      !description ||
      !Array.isArray(technologies) ||
      !url
    ) {
      return res.status(400).json({
        message: "All project fields are required",
      });
    }

    try {
      const result = await pool.query(
        `UPDATE projects
         SET
           number = $1,
           name = $2,
           type = $3,
           image = $4,
           description = $5,
           technologies = $6::jsonb,
           url = $7,
           is_published = $8,
           updated_at = CURRENT_TIMESTAMP
         WHERE id = $9
         RETURNING *`,
        [
          number,
          name,
          type,
          image,
          description,
          JSON.stringify(technologies),
          url,
          isPublished ?? true,
          id,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Project not found",
        });
      }

      res.json({
        message: "Project updated successfully",
        project: result.rows[0],
      });
    } catch (error) {
      console.error(
        "Error updating project:",
        error.message
      );

      res.status(500).json({
        message: "Failed to update project",
      });
    }
  }
);

/* =========================
   DELETE PROJECT
========================= */

app.delete(
  "/api/admin/projects/:id",
  authenticateAdmin,
  async (req, res) => {
    const { id } = req.params;

    try {
      const result = await pool.query(
        `DELETE FROM projects
         WHERE id = $1
         RETURNING *`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Project not found",
        });
      }

      res.json({
        message: "Project deleted successfully",
        project: result.rows[0],
      });
    } catch (error) {
      console.error(
        "Error deleting project:",
        error.message
      );

      res.status(500).json({
        message: "Failed to delete project",
      });
    }
  }
);

/* =========================
   START SERVER
========================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});