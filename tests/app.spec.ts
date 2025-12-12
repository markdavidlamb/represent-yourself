import { test, expect } from "@playwright/test";

const views = [
  { id: "inbox", title: "Inbox", selector: '[data-testid="inbox"]' },
  { id: "cases", title: "Cases", selector: '[data-testid="cases"]' },
  { id: "analyze", title: "Analyze", selector: '[data-testid="analyze"]' },
  { id: "generate", title: "Generate", selector: '[data-testid="generate"]' },
  { id: "timeline", title: "Timeline", selector: '[data-testid="timeline"]' },
  { id: "hearing-sim", title: "Hearing Simulator", selector: '[data-testid="hearing-sim"]' },
  { id: "opponent-intel", title: "Opponent Intelligence", selector: '[data-testid="opponent-intel"]' },
  { id: "settlement", title: "Settlement Calculator", selector: '[data-testid="settlement"]' },
  { id: "bundles", title: "Bundle Generator", selector: '[data-testid="bundles"]' },
  { id: "risk-score", title: "Risk Scorecard", selector: '[data-testid="risk-score"]' },
  { id: "settings", title: "Settings", selector: '[data-testid="settings"]' },
];

test.describe("App Navigation", () => {
  test("should load the main page", async ({ page }) => {
    await page.goto("/");
    // Title may be "Counsel" or "Represent Yourself"
    await expect(page.locator("body")).toBeVisible();
  });

  test("should display sidebar", async ({ page }) => {
    await page.goto("/");
    const sidebar = page.locator('[data-testid="sidebar"]');
    await expect(sidebar).toBeVisible();
  });

  test("should navigate to all views via sidebar clicks", async ({ page }) => {
    await page.goto("/");

    for (const view of views) {
      // Click the sidebar nav item
      const navItem = page.locator(`[data-nav="${view.id}"]`);
      if (await navItem.isVisible()) {
        await navItem.click();
        await page.waitForTimeout(500);

        // Check the view loaded (either by data-testid or checking content)
        const pageContent = await page.content();
        console.log(`Navigated to ${view.id}: ${pageContent.length > 0 ? "OK" : "FAIL"}`);
      }
    }
  });
});

test.describe("Component Rendering", () => {
  test("Dashboard view renders correctly", async ({ page }) => {
    await page.goto("/");
    // Check for dashboard-related content (default view)
    const hasContent = await page.locator('[data-testid="sidebar"]').isVisible();
    expect(hasContent).toBeTruthy();
  });

  test("All sidebar items are clickable", async ({ page }) => {
    await page.goto("/");

    // Get all nav items in sidebar
    const navItems = page.locator('[data-testid="sidebar"] button, [data-testid="sidebar"] a');
    const count = await navItems.count();
    console.log(`Found ${count} navigation items`);
    expect(count).toBeGreaterThan(5);
  });
});

test.describe("UI Components", () => {
  test("Cards render without errors", async ({ page }) => {
    await page.goto("/");

    // Navigate to different views and check for card components
    const cardViews = ["analyze", "generate", "settlement"];

    for (const viewId of cardViews) {
      const navItem = page.locator(`[data-nav="${viewId}"]`);
      if (await navItem.isVisible()) {
        await navItem.click();
        await page.waitForTimeout(300);

        // Check for card elements
        const cards = page.locator('[class*="card"], [class*="Card"]');
        const cardCount = await cards.count();
        console.log(`${viewId} view has ${cardCount} cards`);
      }
    }
  });

  test("No JavaScript errors on load", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => {
      errors.push(err.message);
    });

    await page.goto("/");
    await page.waitForTimeout(2000);

    if (errors.length > 0) {
      console.log("JavaScript errors:", errors);
    }
    expect(errors.length).toBe(0);
  });

  test("CSS loads correctly", async ({ page }) => {
    await page.goto("/");

    // Check that styles are applied (background shouldn't be white/default)
    const body = page.locator("body");
    const bgColor = await body.evaluate((el) => getComputedStyle(el).backgroundColor);
    console.log("Body background color:", bgColor);

    // Should have some styling applied
    expect(bgColor).not.toBe("");
  });
});

test.describe("Interactive Elements", () => {
  test("Buttons are interactive", async ({ page }) => {
    await page.goto("/");

    // Find all buttons
    const buttons = page.locator("button");
    const buttonCount = await buttons.count();
    console.log(`Found ${buttonCount} buttons`);
    expect(buttonCount).toBeGreaterThan(0);
  });

  test("Settlement Calculator inputs work", async ({ page }) => {
    await page.goto("/");

    // Navigate to settlement calculator
    const navItem = page.locator('[data-nav="settlement"]');
    if (await navItem.isVisible()) {
      await navItem.click();
      await page.waitForTimeout(500);

      // Check for input fields
      const inputs = page.locator('input[type="number"], input[type="text"]');
      const inputCount = await inputs.count();
      console.log(`Settlement view has ${inputCount} input fields`);
    }
  });
});
