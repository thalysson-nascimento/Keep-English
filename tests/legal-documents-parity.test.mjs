import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const content = JSON.parse(
  await readFile(
    new URL(
      "../src/features/auth/content/legal-documents.json",
      import.meta.url,
    ),
    "utf8",
  ),
);
const baseUrl = process.env.LEGAL_TEST_APP_URL || "http://localhost:3000";

function visibleText(markup) {
  return markup
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/\s+/g, " ");
}

for (const [key, document] of Object.entries(content.documents)) {
  test(`${key}: app and Blogger render the complete identical document`, async () => {
    const blogger = visibleText(
      await readFile(
        new URL(`../blogger/preview/p/${document.slug}.html`, import.meta.url),
        "utf8",
      ),
    );
    const expected = [
      document.title,
      document.intro,
      content.reviewNotice,
      `Versão ${content.version} · ${content.date}`,
      ...document.sections.flat(),
    ];
    for (const language of ["pt-BR", "en"]) {
      const response = await fetch(`${baseUrl}/${key}`, {
        headers: { "Accept-Language": language },
      });
      assert.equal(response.status, 200);
      const markup = await response.text();
      assert.match(markup, /<article[^>]*lang="pt-BR"/);
      const app = visibleText(markup);
      for (const paragraph of expected) {
        const normalized = paragraph.replace(/\s+/g, " ");
        assert.ok(
          app.includes(normalized),
          `App (${language}) is missing: ${paragraph.slice(0, 65)}`,
        );
        assert.ok(
          blogger.includes(normalized),
          `Blogger is missing: ${paragraph.slice(0, 65)}`,
        );
      }
      assert.equal(
        (markup.match(/<h2\b/g) || []).length,
        document.sections.length,
      );
      if (key === "privacidade") {
        assert.ok(markup.includes(content.googlePrivacy.href));
        assert.ok(app.includes(content.googlePrivacy.label));
      }
    }
  });
}
