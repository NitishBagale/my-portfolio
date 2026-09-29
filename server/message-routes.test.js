const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const { registerMessageDeleteRoutes } = require("./message-routes");

test("message deletion protects both routes, deletes only selected records, and reports failures", async () => {
  let messages = [{ id: 1 }, { id: 2 }, { id: 3 }];
  let queryCount = 0;
  let failQuery = false;
  const pool = {
    async query(sql, params) {
      queryCount++;
      if (failQuery) throw new Error("Database unavailable");
      if (params) {
        assert.equal(sql, "DELETE FROM messages WHERE id = $1 RETURNING id");
        const rows = messages.filter((message) => message.id === Number(params[0]));
        messages = messages.filter((message) => message.id !== Number(params[0]));
        return { rows, rowCount: rows.length };
      }
      assert.equal(sql, "DELETE FROM messages");
      const rowCount = messages.length;
      messages = [];
      return { rowCount };
    },
  };
  const app = express();
  registerMessageDeleteRoutes(app, pool, (req, res, next) => {
    if (req.headers.authorization === "Bearer admin") return next();
    res.sendStatus(req.headers.authorization ? 403 : 401);
  });
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}/api/messages`;
  const remove = (suffix = "", authorization = "Bearer admin") => fetch(base + suffix, {
    method: "DELETE",
    headers: authorization ? { Authorization: authorization } : {},
  });
  try {
    for (const suffix of ["", "/1"]) {
      assert.equal((await remove(suffix, "")).status, 401);
      assert.equal((await remove(suffix, "Bearer non-admin")).status, 403);
    }
    for (const suffix of ["/abc", "/0", "/-1", "/1%20OR%201=1"]) {
      assert.equal((await remove(suffix)).status, 400);
    }
    assert.equal(queryCount, 0);
    const single = await remove("/2");
    assert.equal(single.status, 200);
    assert.equal((await single.json()).id, 2);
    assert.deepEqual(messages, [{ id: 1 }, { id: 3 }]);
    assert.equal((await remove("/2")).status, 404);
    failQuery = true;
    assert.equal((await remove("/1")).status, 500);
    assert.equal((await remove()).status, 500);
    assert.deepEqual(messages, [{ id: 1 }, { id: 3 }]);
    failQuery = false;
    const all = await remove();
    assert.equal(all.status, 200);
    assert.equal((await all.json()).deletedCount, 2);
    assert.deepEqual(messages, []);
    assert.equal((await (await remove()).json()).deletedCount, 0);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
