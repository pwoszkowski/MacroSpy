import { test, expect } from "@playwright/test";

test.describe("Example E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Setup przed każdym testem
    await page.goto("/");
  });

  test("should load homepage", async ({ page }) => {
    await expect(page).toHaveTitle(/MacroSpy/);
  });

  test("should have main navigation", async ({ page }) => {
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();
  });

  // Przykład użycia screenshot comparison
  test("homepage visual regression", async ({ page }) => {
    await expect(page).toHaveScreenshot("homepage.png");
  });
});
