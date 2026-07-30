import { test, expect } from "@playwright/test";

// Verifies the "skip this question, answer it later" flow: skipping swaps in
// a different question without touching score, hides itself once answered,
// and the skipped question is guaranteed to resurface (as the very last item
// in the deck) rather than being lost.

test("skipping swaps to a new question without affecting score, and hides once answered", async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(err.message));

  await page.goto("/mcq");

  const scenario = page.locator("p.whitespace-pre-line");
  await expect(scenario).toBeVisible();
  const firstScenario = await scenario.textContent();

  const skipButton = page.getByRole("button", { name: /Skip this question/ });
  await expect(skipButton).toBeVisible();
  await skipButton.click();

  await expect(scenario).not.toHaveText(firstScenario ?? "");
  await expect(page.getByText("1 skipped")).toBeVisible();
  await expect(page.getByText("0 correct")).toBeVisible();

  await page.locator('[data-testid="mcq-option"]').first().locator("span").first().click(); // the badge span, not the option text -- text can contain a real link now
  await expect(page.getByRole("button", { name: /Skip this question/ })).not.toBeVisible();

  expect(consoleErrors, `Console errors: ${consoleErrors.join("\n")}`).toEqual([]);
});

test("a skipped question is requeued to the end of the deck and can be answered later", async ({
  page,
}) => {
  test.setTimeout(90_000);

  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(err.message));

  await page.goto("/mcq");

  const scenario = page.locator("p.whitespace-pre-line");
  const progress = page.getByText(/^Question \d+ of \d+/);
  await expect(progress).toBeVisible();

  const totalMatch = (await progress.textContent())?.match(/of (\d+)/);
  const total = Number(totalMatch?.[1]);
  expect(total).toBeGreaterThan(1);

  const firstScenario = await scenario.textContent();

  await page.getByRole("button", { name: /Skip this question/ }).click();
  await expect(page.getByText("1 skipped")).toBeVisible();

  // Answer every other question, walking the skipped one to the back of the queue.
  for (let i = 0; i < total - 1; i++) {
    await page.locator('[data-testid="mcq-option"]').first().locator("span").first().click(); // the badge span, not the option text -- text can contain a real link now
    await page.getByRole("button", { name: /Next question|See results/ }).click();
  }

  // It should now be the very last question shown, flagged as a revisit.
  await expect(scenario).toHaveText(firstScenario ?? "");
  await expect(page.getByText("Skipped earlier")).toBeVisible();
  await expect(page.getByText("1 skipped")).toBeVisible();
  await expect(page.getByRole("button", { name: /Skip this question/ })).not.toBeVisible();

  await page.locator('[data-testid="mcq-option"]').first().locator("span").first().click(); // the badge span, not the option text -- text can contain a real link now
  await page.getByRole("button", { name: "See results" }).click();

  await expect(page.getByText(new RegExp(`/ ${total} correct`))).toBeVisible();

  expect(consoleErrors, `Console errors: ${consoleErrors.join("\n")}`).toEqual([]);
});
