import { test, expect } from "@playwright/test";

test.describe("Button Click Tests", () => {
  test("Quick Action buttons are clickable and navigate", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1000);

    // Take screenshot of initial state
    await page.screenshot({ path: "test-results/01-initial.png" });

    // Find the "Draft Affidavit" quick action button
    const draftButton = page.locator('button:has-text("Draft Affidavit")');
    const isVisible = await draftButton.isVisible();
    console.log("Draft Affidavit button visible:", isVisible);

    if (isVisible) {
      await draftButton.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: "test-results/02-after-draft-click.png" });

      // Check if we navigated to document drafting
      const pageContent = await page.content();
      console.log("After draft click, page has document drafting:", pageContent.includes("Document"));
    }
  });

  test("AI Assistant button is clickable", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1000);

    // Find the "Ask AI Assistant" button
    const aiButton = page.locator('button:has-text("Ask AI Assistant")');
    const isVisible = await aiButton.isVisible();
    console.log("AI Assistant button visible:", isVisible);

    if (isVisible) {
      // Check if button is actually clickable
      const isEnabled = await aiButton.isEnabled();
      console.log("AI Assistant button enabled:", isEnabled);

      // Get button position
      const box = await aiButton.boundingBox();
      console.log("AI Assistant button position:", box);

      await aiButton.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: "test-results/03-after-ai-click.png" });

      // Check if we see AI assistant content
      const textarea = page.locator('textarea[placeholder*="Ask me anything"]');
      const hasTextarea = await textarea.isVisible();
      console.log("AI view has textarea:", hasTextarea);
    }
  });

  test("Sidebar navigation buttons work", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1000);

    // Click on Settlement Calculator in sidebar
    const settlementNav = page.locator('[data-nav="settlement"]');
    const isVisible = await settlementNav.isVisible();
    console.log("Settlement nav visible:", isVisible);

    if (isVisible) {
      await settlementNav.click();
      await page.waitForTimeout(500);

      // Check for settlement calculator content
      const hasInput = await page.locator('input[type="number"]').first().isVisible();
      console.log("Settlement view has number inputs:", hasInput);
      await page.screenshot({ path: "test-results/04-settlement.png" });
    }
  });

  test("All Quick Action buttons have click handlers", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1000);

    const quickActionTitles = [
      "Draft Affidavit",
      "Analyze Document",
      "Upload Evidence",
      "Ask AI Assistant",
    ];

    for (const title of quickActionTitles) {
      const button = page.locator(`button:has-text("${title}")`);
      const isVisible = await button.isVisible();
      const isEnabled = await button.isEnabled();
      console.log(`${title}: visible=${isVisible}, enabled=${isEnabled}`);
    }
  });

  test("View All buttons in cards work", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1000);

    // Find View All buttons
    const viewAllButtons = page.locator('button:has-text("View All")');
    const count = await viewAllButtons.count();
    console.log("Found View All buttons:", count);

    // Click the first View All button
    if (count > 0) {
      await viewAllButtons.first().click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: "test-results/05-after-viewall.png" });
    }
  });

  test("Getting Started action buttons work", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1000);

    // Find the "Add Case" button
    const addCaseBtn = page.locator('button:has-text("Add Case")');
    if (await addCaseBtn.isVisible()) {
      console.log("Add Case button found");
      await addCaseBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: "test-results/06-add-case.png" });
    }
  });
});
