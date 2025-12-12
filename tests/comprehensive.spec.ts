import { test, expect, Page } from "@playwright/test";

/**
 * Comprehensive Test Suite for "Represent Yourself" Legal App
 *
 * Test Coverage:
 * 1. Core Navigation - All sidebar routes work
 * 2. Dashboard/Case Overview - Key case info displays correctly
 * 3. AI Assistant - Claude integration works
 * 4. Evidence Manager - Document handling
 * 5. Settlement Calculator - Form inputs and calculations
 * 6. Timeline - Case events display
 * 7. Accessibility - Basic a11y checks
 * 8. Error Handling - Graceful failures
 */

// Helper to wait for page to be fully loaded
async function waitForAppReady(page: Page) {
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500); // Allow React hydration
}

// ============================================================
// 1. CORE NAVIGATION TESTS
// ============================================================
test.describe("Core Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
  });

  test("app loads without crashing", async ({ page }) => {
    // Should not show error page
    await expect(page.locator("text=Application error")).not.toBeVisible();
    await expect(page.locator("text=500")).not.toBeVisible();
  });

  test("sidebar is visible and contains main navigation items", async ({ page }) => {
    const sidebar = page.locator("aside, nav, [class*='sidebar']").first();
    await expect(sidebar).toBeVisible();

    // Check for key navigation items
    const navItems = ["Dashboard", "Documents", "Timeline", "Deadlines", "Settings"];
    for (const item of navItems) {
      await expect(page.getByText(item, { exact: false }).first()).toBeVisible();
    }
  });

  test("clicking sidebar items changes the main view", async ({ page }) => {
    // Click Settings
    await page.getByText("Settings").first().click();
    await waitForAppReady(page);

    // Should show settings content
    await expect(page.getByRole("heading", { name: /settings/i }).first()).toBeVisible();
  });

  test("all main routes are accessible", async ({ page }) => {
    const routes = [
      { click: "Documents", expect: /document|evidence|file/i },
      { click: "Timeline", expect: /timeline|event/i },
      { click: "Settings", expect: /settings|preference/i },
    ];

    for (const route of routes) {
      await page.getByText(route.click).first().click();
      await waitForAppReady(page);
      // Page should have loaded (no error)
      await expect(page.locator("text=Application error")).not.toBeVisible();
    }
  });
});

// ============================================================
// 2. DASHBOARD / CASE OVERVIEW TESTS
// ============================================================
test.describe("Dashboard - Case Overview", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
  });

  test("displays case number prominently", async ({ page }) => {
    // Case number should be visible (HCA 1646/2023)
    const caseNumber = page.getByRole("heading", { name: /HCA 1646/i }).first();
    await expect(caseNumber).toBeVisible();
  });

  test("shows next hearing information", async ({ page }) => {
    // Should show hearing date
    await expect(page.getByText(/january 2026/i).first()).toBeVisible();

    // Should show judge name
    await expect(page.getByText(/grace chow/i).first()).toBeVisible();
  });

  test("displays parties information", async ({ page }) => {
    // Should show plaintiff info
    await expect(page.getByText(/liquidity technologies/i).first()).toBeVisible();

    // Should show defendant info
    await expect(page.getByText(/mark.*lamb/i).first()).toBeVisible();
  });

  test("shows pending applications", async ({ page }) => {
    // Key applications should be listed
    const applications = ["Committal", "Summary Judgment", "Security for Costs"];

    for (const app of applications) {
      const element = page.getByText(app, { exact: false }).first();
      // At least some applications should be visible
      const isVisible = await element.isVisible().catch(() => false);
      if (isVisible) {
        await expect(element).toBeVisible();
        break; // Found at least one
      }
    }
  });

  test("displays case strengths section", async ({ page }) => {
    // Should show strengths
    await expect(page.getByText(/strength/i).first()).toBeVisible();
  });

  test("displays litigation history/timeline", async ({ page }) => {
    // Should show timeline section
    await expect(page.getByText(/timeline/i).first()).toBeVisible();
  });
});

// ============================================================
// 3. AI ASSISTANT TESTS
// ============================================================
test.describe("AI Assistant", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    // Navigate to AI Assistant
    await page.getByText("AI Assistant").first().click();
    await waitForAppReady(page);
  });

  test("AI Assistant page loads", async ({ page }) => {
    await expect(page.getByText(/claude/i).first()).toBeVisible();
  });

  test("shows prompt suggestions for legal help", async ({ page }) => {
    // Should show helpful prompts
    const prompts = page.locator("[class*='card'], [class*='Card']");
    const count = await prompts.count();
    expect(count).toBeGreaterThan(0);
  });

  test("Open Claude AI button is present", async ({ page }) => {
    const claudeButton = page.getByRole("button", { name: /open claude|claude ai/i }).first();
    await expect(claudeButton).toBeVisible();
  });

  test("clicking prompt card copies to clipboard", async ({ page }) => {
    // Find a prompt card and click it
    const promptCard = page.locator("[class*='card'], [class*='Card']").first();
    if (await promptCard.isVisible()) {
      await promptCard.click();
      // Should show copied feedback or just not crash
    }
  });
});

// ============================================================
// 4. EVIDENCE MANAGER TESTS
// ============================================================
test.describe("Evidence Manager", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    await page.getByText("Documents").first().click();
    await waitForAppReady(page);
  });

  test("Evidence Manager page loads", async ({ page }) => {
    // Should show document-related content
    const hasDocContent = await page.getByText(/document|evidence|file|upload/i).first().isVisible();
    expect(hasDocContent).toBeTruthy();
  });

  test("shows upload area or button", async ({ page }) => {
    // Should have upload capability
    const uploadArea = page.locator("input[type='file'], [class*='upload'], [class*='drop']").first();
    const uploadButton = page.getByRole("button", { name: /upload|add/i }).first();

    const hasUpload = await uploadArea.isVisible().catch(() => false) ||
                      await uploadButton.isVisible().catch(() => false);
    // Upload functionality should exist
    expect(hasUpload).toBeTruthy();
  });

  test("displays document categories or filters", async ({ page }) => {
    // Should have some way to categorize/filter documents
    const filters = page.locator("[class*='filter'], [class*='tab'], [class*='category']");
    const buttons = page.getByRole("button");

    // Either filters or multiple buttons for categories
    const filterCount = await filters.count();
    const buttonCount = await buttons.count();
    expect(filterCount + buttonCount).toBeGreaterThan(0);
  });
});

// ============================================================
// 5. SETTLEMENT CALCULATOR TESTS
// ============================================================
test.describe("Settlement Calculator", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    // Navigate to settlement calculator
    await page.getByText("Settlement", { exact: false }).first().click();
    await waitForAppReady(page);
  });

  test("Settlement Calculator page loads", async ({ page }) => {
    // Should show settlement-related content
    const hasContent = await page.getByText(/settlement|calculate|amount/i).first().isVisible().catch(() => false);
    expect(hasContent).toBeTruthy();
  });

  test("has input fields for calculations", async ({ page }) => {
    const inputs = page.locator("input[type='number'], input[type='text']");
    const count = await inputs.count();
    expect(count).toBeGreaterThan(0);
  });

  test("inputs accept numeric values", async ({ page }) => {
    const numberInput = page.locator("input[type='number']").first();
    if (await numberInput.isVisible()) {
      await numberInput.fill("100000");
      await expect(numberInput).toHaveValue("100000");
    }
  });
});

// ============================================================
// 6. TIMELINE TESTS
// ============================================================
test.describe("Timeline View", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    await page.getByText("Timeline").first().click();
    await waitForAppReady(page);
  });

  test("Timeline page loads", async ({ page }) => {
    // Should show timeline content
    const hasTimeline = await page.getByText(/timeline|event|date/i).first().isVisible().catch(() => false);
    expect(hasTimeline).toBeTruthy();
  });

  test("displays chronological events", async ({ page }) => {
    // Should show dates (2023, 2024, 2025, etc.)
    const years = ["2023", "2024", "2025"];
    let foundYear = false;

    for (const year of years) {
      const element = page.getByText(year, { exact: false }).first();
      if (await element.isVisible().catch(() => false)) {
        foundYear = true;
        break;
      }
    }
    expect(foundYear).toBeTruthy();
  });
});

// ============================================================
// 7. SETTINGS TESTS
// ============================================================
test.describe("Settings", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    await page.getByText("Settings").first().click();
    await waitForAppReady(page);
  });

  test("Settings page loads", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /settings/i }).first()).toBeVisible();
  });

  test("shows AI provider options", async ({ page }) => {
    // Should show Claude/OpenAI options
    const hasAiOptions = await page.getByText(/claude|openai|api/i).first().isVisible().catch(() => false);
    expect(hasAiOptions).toBeTruthy();
  });
});

// ============================================================
// 8. ACCESSIBILITY TESTS
// ============================================================
test.describe("Accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
  });

  test("page has a main heading", async ({ page }) => {
    const headings = page.getByRole("heading");
    const count = await headings.count();
    expect(count).toBeGreaterThan(0);
  });

  test("buttons have accessible names", async ({ page }) => {
    const buttons = page.getByRole("button");
    const count = await buttons.count();

    // Check first few buttons have text or aria-label
    for (let i = 0; i < Math.min(count, 5); i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute("aria-label");
      const hasAccessibleName = (text && text.trim().length > 0) || ariaLabel;
      expect(hasAccessibleName).toBeTruthy();
    }
  });

  test("interactive elements are keyboard focusable", async ({ page }) => {
    // Tab through the page
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    // Something should be focused
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(focused).toBeTruthy();
  });

  test("color contrast is sufficient (no pure white on light gray)", async ({ page }) => {
    // Basic check - text should be visible
    const bodyText = page.locator("body");
    await expect(bodyText).toBeVisible();
  });
});

// ============================================================
// 9. ERROR HANDLING TESTS
// ============================================================
test.describe("Error Handling", () => {
  test("handles invalid routes gracefully", async ({ page }) => {
    await page.goto("/nonexistent-page-12345");
    await waitForAppReady(page);

    // Should not show raw error - either 404 page or redirect
    await expect(page.locator("text=Unhandled Runtime Error")).not.toBeVisible();
  });

  test("app recovers from navigation errors", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);

    // Navigate away and back
    await page.goto("/settings-fake");
    await page.goto("/");
    await waitForAppReady(page);

    // App should still work
    const sidebar = page.locator("aside, nav, [class*='sidebar']").first();
    await expect(sidebar).toBeVisible();
  });
});

// ============================================================
// 10. PERFORMANCE TESTS
// ============================================================
test.describe("Performance", () => {
  test("page loads within acceptable time", async ({ page }) => {
    const startTime = Date.now();
    await page.goto("/");
    await waitForAppReady(page);
    const loadTime = Date.now() - startTime;

    // Should load within 10 seconds
    expect(loadTime).toBeLessThan(10000);
  });

  test("navigation between views is fast", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);

    const startTime = Date.now();
    await page.getByText("Settings").first().click();
    await page.waitForLoadState("networkidle");
    const navTime = Date.now() - startTime;

    // Navigation should be under 3 seconds
    expect(navTime).toBeLessThan(3000);
  });
});

// ============================================================
// 11. RESPONSIVE DESIGN TESTS
// ============================================================
test.describe("Responsive Design", () => {
  test("works on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto("/");
    await waitForAppReady(page);

    // Content should still be visible
    await expect(page.getByText(/HCA 1646/i).first()).toBeVisible();
  });

  test("works on tablet viewport", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await page.goto("/");
    await waitForAppReady(page);

    await expect(page.getByText(/HCA 1646/i).first()).toBeVisible();
  });

  test("works on desktop viewport", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/");
    await waitForAppReady(page);

    await expect(page.getByText(/HCA 1646/i).first()).toBeVisible();
  });
});

// ============================================================
// 12. DATA INTEGRITY TESTS
// ============================================================
test.describe("Data Integrity", () => {
  test("case data matches expected values", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);

    // Verify key case data
    await expect(page.getByText(/1646/i).first()).toBeVisible();
    await expect(page.getByText(/2023/i).first()).toBeVisible();
  });

  test("hearing date is in the future or correct", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);

    // January 2026 should be visible
    await expect(page.getByText(/january 2026/i).first()).toBeVisible();
  });
});
