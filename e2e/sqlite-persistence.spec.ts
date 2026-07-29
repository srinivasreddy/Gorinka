import { test, expect } from "@playwright/test";

// Verifies that SRS progress (stored via sql.js + IndexedDB, replacing the
// old localStorage-only store) actually survives a full page reload -- the
// one thing that can't be confirmed by static/server-side checks alone,
// since sql.js only runs in the browser.
test("rating a card persists across a reload", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(err.message));

  await page.goto("/flashcards/compute");

  const status = page.getByText(/\d+ studied/);
  await expect(status).toBeVisible();
  await expect(status).toHaveText(/0 studied/);

  const nextButton = page.getByRole("button", { name: "Next card" });
  await expect(nextButton).toBeVisible();

  // First press reveals the answer; second press rates it "Good" and
  // advances -- this is what triggers the SQLite write via useStudyQueue's
  // rate mutation.
  await nextButton.click();
  await nextButton.click();

  await expect(status).toHaveText(/1 studied/);

  // Give the async sql.js export + IndexedDB put a moment to flush before
  // reloading -- the mutation awaits it, but the click above doesn't block
  // on React's state settling.
  await page.waitForTimeout(500);

  await page.reload();

  await expect(status).toBeVisible();
  await expect(status).toHaveText(/1 studied/);

  expect(consoleErrors, `Console errors: ${consoleErrors.join("\n")}`).toEqual([]);
});
