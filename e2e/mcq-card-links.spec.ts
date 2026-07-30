import { test, expect } from "@playwright/test";

// Verifies MCQ questions can hyperlink to a specific flashcard, opening it in
// a new tab (so in-progress quiz state in the original tab is never lost)
// and landing on the exact linked card rather than the category's due queue.
test("clicking a term in an MCQ question opens the linked flashcard in a new tab", async ({
  page,
  context,
}) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(err.message));

  await page.goto("/mcq");

  // vpc-privatelink-shared-services is the first question; its scenario text
  // links "VPC peering" to the "VPC Peering" flashcard. Card terms inside
  // answer options are deliberately non-interactive so the option remains a
  // single native button.
  const link = page.getByRole("link", { name: "VPC peering" }).first();
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute(
    "href",
    "/flashcards/networking?card=VPC%20Peering"
  );
  await expect(link).toHaveAttribute("target", "_blank");

  const [newPage] = await Promise.all([context.waitForEvent("page"), link.click()]);
  await newPage.waitForLoadState();

  await expect(newPage).toHaveURL(
    /\/flashcards\/networking\?card=VPC(?:%20|\+)Peering/
  );

  const front = newPage.locator("p", { hasText: "VPC Peering" }).first();
  await expect(front).toBeVisible();

  // The lookup should show the card itself (with a Back control), not the
  // category's normal due-queue state.
  await expect(newPage.getByRole("button", { name: /Back/ })).toBeVisible();

  await newPage.reload();
  await expect(newPage.locator("p", { hasText: "VPC Peering" }).first()).toBeVisible();
  await expect(newPage).toHaveURL(
    /\/flashcards\/networking\?card=VPC(?:%20|\+)Peering/
  );

  expect(consoleErrors, `Console errors: ${consoleErrors.join("\n")}`).toEqual([]);
});

test("answer options remain native buttons without nested links", async ({ page }) => {
  await page.goto("/mcq");

  const firstOption = page.getByTestId("mcq-option").first();
  await expect(firstOption).toHaveRole("button");
  await expect(firstOption.getByRole("link")).toHaveCount(0);

  await firstOption.focus();
  await page.keyboard.press("Enter");
  await expect(firstOption).toBeDisabled();
});
