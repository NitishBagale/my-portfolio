const test = require("node:test");
const assert = require("node:assert/strict");
const { contentUpdateHandler, schemas } = require("./content-update");

function response() {
  return {
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

for (const [section, schema] of Object.entries(schemas)) {
  test(`${section}: all editable fields survive saves, including empty text and removed items`, async () => {
    let stored = { image: "/existing-image.jpg", unedited: "preserved" };
    const pool = {
      async query(sql, [json, key]) {
        assert.match(sql, /COALESCE\(content, '\{\}'::jsonb\) \|\| \$1::jsonb/);
        assert.equal(key, section);
        stored = { ...stored, ...JSON.parse(json) };
        return { rows: [{ content: { ...stored } }] };
      },
    };
    const handler = contentUpdateHandler(pool, section);
    const edited = Object.fromEntries(
      schema.strings.map((key) => [key, `edited ${key}`]),
    );
    for (const key of schema.arrays) edited[key] = [{ title: "Edited item" }];
    const saved = response();
    await handler({ body: edited }, saved);
    assert.equal(saved.statusCode, 200);
    for (const key of schema.strings.filter(
      (k) => !["title", "buttonText"].includes(k),
    ))
      assert.equal(saved.body.content[key], edited[key]);
    const cleared = Object.fromEntries(schema.strings.map((key) => [key, ""]));
    for (const key of schema.arrays) cleared[key] = [];
    const res = response();
    await handler({ body: cleared }, res);
    assert.equal(res.statusCode, 200);
    for (const key of schema.strings) assert.equal(res.body.content[key], "");
    for (const key of schema.arrays)
      assert.deepEqual(res.body.content[key], []);
    assert.equal(res.body.content.unedited, "preserved");
  });
}

test("wrong types are rejected before any database write", async () => {
  const handler = contentUpdateHandler(
    {
      query() {
        assert.fail("Unexpected database write");
      },
    },
    "hero",
  );
  const res = response();
  await handler({ body: { name: null } }, res);
  assert.equal(res.statusCode, 400);
});

test("hero compatibility and in-flight edits do not restore old text", async () => {
  const { normalizeHero, applySavedContent } =
    await import("../client/src/config/content.js");
  assert.equal(
    normalizeHero({ title: "Only", buttonText: "Work" }).name,
    "Only",
  );
  const submitted = { name: "", primaryButton: "", secondaryButton: "" };
  assert.deepEqual(normalizeHero(submitted), submitted);
  const current = { ...submitted, name: "Newer draft" };
  assert.equal(
    applySavedContent(current, submitted, { name: "Old response" }),
    current,
  );
  assert.equal(applySavedContent(submitted, submitted, submitted).name, "");
});
