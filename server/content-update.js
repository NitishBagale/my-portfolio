const schemas = {
  projects: {
    strings: ["number", "label", "heading", "headingAccent", "description", "selectedWorkLabel"],
    arrays: [],
  },
  hero: {
    strings: [
      "topLabel",
      "name",
      "title",
      "description",
      "primaryButton",
      "secondaryButton",
      "buttonText",
      "buttonUrl",
      "secondaryButtonUrl",
      "image",
    ],
    arrays: [],
  },
  about: {
    strings: ["topLabel", "heading", "description", "buttonText", "buttonUrl"],
    arrays: ["cards"],
  },
  skills: {
    strings: ["topLabel", "kicker", "heading", "description", "learningText"],
    arrays: ["groups"],
  },
  contact: {
    strings: [
      "topLabel",
      "heading",
      "badge",
      "mainTitle",
      "mainTitleAccent",
      "description",
      "noteTitle",
      "noteDescription",
      "signature",
      "signatureAccent",
      "formLabel",
      "formTitle",
      "nameLabel",
      "namePlaceholder",
      "emailLabel",
      "emailPlaceholder",
      "messageLabel",
      "messagePlaceholder",
      "submitText",
      "formHint",
    ],
    arrays: [],
  },
};

function contentUpdateHandler(pool, section, { createIfMissing = false } = {}) {
  const schema = schemas[section];
  return async (req, res) => {
    const body = req.body;
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return res.status(400).json({ message: "Content must be an object." });
    }
    const updates = {};
    for (const field of [...schema.strings, ...schema.arrays]) {
      if (!Object.hasOwn(body, field)) continue;
      const valid = schema.arrays.includes(field)
        ? Array.isArray(body[field])
        : typeof body[field] === "string";
      if (!valid) {
        return res.status(400).json({ message: `Invalid value for ${field}.` });
      }
      // An empty string is an intentional edit, not a missing value.
      updates[field] = body[field];
    }
    if (!Object.keys(updates).length) {
      return res
        .status(400)
        .json({ message: "No editable content was supplied." });
    }
    if (section === "hero") {
      if ("name" in updates || "title" in updates) {
        updates.name = updates.title = updates.name ?? updates.title;
      }
      if ("primaryButton" in updates || "buttonText" in updates) {
        updates.primaryButton = updates.buttonText =
          updates.primaryButton ?? updates.buttonText;
      }
    }
    try {
      // Preserve stored fields that aren't exposed by this editor.
      const result = await pool.query(
        createIfMissing
          ? `INSERT INTO site_content (section, content)
             VALUES ($2, $1::jsonb)
             ON CONFLICT (section) DO UPDATE
             SET content = COALESCE(site_content.content, '{}'::jsonb) || EXCLUDED.content,
                 updated_at = CURRENT_TIMESTAMP
             RETURNING content`
          : `UPDATE site_content
         SET content = COALESCE(content, '{}'::jsonb) || $1::jsonb,
             updated_at = CURRENT_TIMESTAMP
         WHERE section = $2
         RETURNING content`,
        [JSON.stringify(updates), section],
      );
      if (!result.rows.length) {
        return res
          .status(404)
          .json({ message: `${section} content not found` });
      }
      return res.json({
        message: "Content updated successfully",
        content: result.rows[0].content,
      });
    } catch (error) {
      console.error(`Error updating ${section} content:`, error.message);
      return res
        .status(500)
        .json({ message: `Failed to update ${section} content` });
    }
  };
}

module.exports = { contentUpdateHandler, schemas };
