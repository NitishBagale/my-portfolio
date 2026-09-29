const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const { registerNavigationRoutes } = require("./navigation-routes");
const defaults = require("../client/src/data/navigation-footer.json");

test("Navbar and Footer routes protect writes and preserve full content through save/reload", async () => {
  const stored = structuredClone(defaults);
  const app = express();
  app.use(express.json());
  const authenticateAdmin = (req, res, next) =>
    req.headers.authorization === "Bearer test-admin"
      ? next()
      : res.status(401).json({ message: "Access token required" });
  const pool = {
    async query(sql, params) {
      if (sql.startsWith("SELECT"))
        return {
          rows: stored[params[0]]
            ? [{ content: structuredClone(stored[params[0]]) }]
            : [],
        };
      const [json, section] = params;
      if (!stored[section]) return { rows: [] };
      stored[section] = { ...stored[section], ...JSON.parse(json) };
      return { rows: [{ content: structuredClone(stored[section]) }] };
    },
  };
  registerNavigationRoutes(app, pool, authenticateAdmin);
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const request = (section, data, auth = true) =>
    fetch(`${base}/api/admin/content/${section}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(auth ? { Authorization: "Bearer test-admin" } : {}),
      },
      body: JSON.stringify(data),
    });
  try {
    for (const section of ["navbar", "footer"]) {
      assert.equal(
        (await fetch(`${base}/api/admin/content/${section}`)).status,
        401,
      );
      assert.equal(
        (await request(section, defaults[section], false)).status,
        401,
      );
      const changed = {
        ...defaults[section],
        links: [
          { label: "Selected work", href: "#projects" },
          { label: "Home", href: "#home" },
        ],
      };
      if (section === "footer") {
        changed.credit = "";
        changed.location = "New location";
        changed.email = "hello@example.com";
        changed.whatsapp = "+977 9800000000";
      }
      const saved = await request(section, changed);
      assert.equal(saved.status, 200);
      assert.deepEqual((await saved.json()).content, changed);
      assert.deepEqual(
        await (await fetch(`${base}/api/content/${section}`)).json(),
        changed,
      );
      assert.equal(
        (
          await request(section, {
            links: [{ label: "Unsafe", href: "javascript:alert(1)" }],
          })
        ).status,
        400,
      );
      assert.equal(
        (
          await request(section, {
            links: [{ label: "Unsafe", href: "//evil.example" }],
          })
        ).status,
        400,
      );
      assert.equal(
        (await request(section, { links: [{ label: "", href: "#home" }] }))
          .status,
        400,
      );
      assert.equal((await request(section, { links: [] })).status, 200);
      assert.deepEqual(
        (await (await fetch(`${base}/api/content/${section}`)).json()).links,
        [],
      );
    }
    assert.equal((await request("footer", { email: "invalid" })).status, 400);
    assert.equal((await request("footer", { whatsapp: "abc" })).status, 400);
    for (const section of ["navbar", "footer"]) {
      delete stored[section];
      const originalQuery = pool.query;
      pool.query = async (sql, params) => {
        assert.ok(sql.startsWith("SELECT"), "Fallback reads must never write to the database");
        return originalQuery(sql, params);
      };
      const response = await fetch(`${base}/api/content/${section}`);
      assert.equal(response.status, 200);
      assert.deepEqual(await response.json(), defaults[section]);
      assert.equal(stored[section], undefined);
      // Preserve the existing admin behavior for missing CMS records.
      assert.equal((await fetch(`${base}/api/admin/content/${section}`, {
        headers: { Authorization: "Bearer test-admin" },
      })).status, 404);
      pool.query = originalQuery;
    }
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
