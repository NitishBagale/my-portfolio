const { contentUpdateHandler, schemas } = require("./content-update");

const footerStrings = [
  "contactHeading",
  "emailLabel",
  "email",
  "emailPlaceholder",
  "whatsappLabel",
  "whatsapp",
  "phonePlaceholder",
  "sectionsHeading",
  "navigationLabel",
  "locationHeading",
  "location",
  "locationPlaceholder",
  "locationNote",
  "connectHeading",
  "invitationTitle",
  "invitationAccent",
  "invitationDescription",
  "whatsappButton",
  "whatsappPlaceholder",
  "fallbackText",
  "fallbackUrl",
  "copyrightText",
  "credit",
  "backToTopText",
  "backToTopUrl",
];

// Extend the existing content handler without changing any completed section.
schemas.navbar = { strings: ["ariaLabel"], arrays: ["links"] };
schemas.footer = { strings: footerStrings, arrays: ["links"] };

function safeLink(value) {
  if (typeof value !== "string" || /[\s\\\u0000-\u001f]/.test(value))
    return false;
  if (/^#[^#]+$/.test(value) || /^\/(?!\/)/.test(value)) return true;
  try {
    const url = new URL(value);
    return (
      ["https:", "http:"].includes(url.protocol) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

function validateNavigationContent(req, res, next) {
  const body = req.body;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return res.status(400).json({ message: "Content must be an object." });
  }
  if (Object.hasOwn(body, "links")) {
    if (
      !Array.isArray(body.links) ||
      body.links.length > 20 ||
      body.links.some(
        (link) =>
          !link ||
          typeof link !== "object" ||
          typeof link.label !== "string" ||
          !link.label.trim() ||
          link.label.length > 100 ||
          !safeLink(link.href),
      )
    ) {
      return res
        .status(400)
        .json({
          message:
            "Each link needs a label and a valid #section, /path, or http(s) URL (maximum 20 links).",
        });
    }
  }
  for (const field of ["fallbackUrl", "backToTopUrl"]) {
    if (Object.hasOwn(body, field) && !safeLink(body[field])) {
      return res
        .status(400)
        .json({ message: `Enter a valid link for ${field}.` });
    }
  }
  if (
    Object.hasOwn(body, "email") &&
    (typeof body.email !== "string" ||
      (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)))
  ) {
    return res
      .status(400)
      .json({ message: "Enter a valid email address or leave it empty." });
  }
  if (
    Object.hasOwn(body, "whatsapp") &&
    (typeof body.whatsapp !== "string" ||
      (body.whatsapp &&
        (!/^\+?[\d ()-]+$/.test(body.whatsapp) ||
          !/^\d{7,15}$/.test(body.whatsapp.replace(/\D/g, "")))))
  ) {
    return res
      .status(400)
      .json({
        message:
          "Enter a WhatsApp number with country code, or leave it empty.",
      });
  }
  next();
}

function registerNavigationRoutes(app, pool, authenticateAdmin) {
  for (const section of ["navbar", "footer"]) {
    const read = async (_req, res) => {
      try {
        const result = await pool.query(
          "SELECT content FROM site_content WHERE section = $1",
          [section],
        );
        if (!result.rows.length)
          return res
            .status(404)
            .json({
              message: `${section} content not found. Run the Navbar/Footer SQL migration.`,
            });
        res.json(result.rows[0].content);
      } catch (error) {
        console.error(`Error fetching ${section}:`, error.message);
        res.status(500).json({ message: `Failed to fetch ${section} content` });
      }
    };
    app.get(`/api/content/${section}`, read);
    app.get(`/api/admin/content/${section}`, authenticateAdmin, read);
    app.put(
      `/api/admin/content/${section}`,
      authenticateAdmin,
      validateNavigationContent,
      contentUpdateHandler(pool, section),
    );
  }
}

module.exports = {
  registerNavigationRoutes,
  validateNavigationContent,
  safeLink,
};
