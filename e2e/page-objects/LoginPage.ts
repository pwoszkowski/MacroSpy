import { Page, Locator } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[id="email"]');
    this.passwordInput = page.locator('input[id="password"]');
    this.loginButton = page.locator('button[type="submit"]').filter({ hasText: "Zaloguj się" });
  }

  async goto() {
    await this.page.goto("/login");
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async clickLoginButton() {
    await this.loginButton.click();
  }

  async login(email: string, password: string) {
    // Wait for form to be stable and visible
    await this.emailInput.waitFor({ state: "visible", timeout: 5000 });
    await this.passwordInput.waitFor({ state: "visible", timeout: 5000 });

    // Clear fields first
    await this.emailInput.clear();
    await this.passwordInput.clear();

    // Fill fields
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);

    // Check if login button is enabled before clicking
    const isButtonEnabled = await this.loginButton.isEnabled();
    console.log("Login button enabled:", isButtonEnabled);

    if (!isButtonEnabled) {
      throw new Error("Login button is disabled - check form validation");
    }

    // Click login button
    await this.clickLoginButton();

    // Wait a moment for form submission
    await this.page.waitForTimeout(1000);

    // Check for any error messages
    const errorLocator = this.page.locator(".text-red-600");
    const errorCount = await errorLocator.count();
    if (errorCount > 0) {
      const errorText = await errorLocator.first().textContent();
      console.log("Login error found:", errorText);
      throw new Error(`Login failed with error: ${errorText}`);
    }

    // Wait for page reload after successful login (window.location.reload())
    await this.page.waitForLoadState("networkidle", { timeout: 10000 });

    // Check current URL after reload
    const currentURL = this.page.url();
    console.log("Current URL after login:", currentURL);

    // If we're still on login page, login failed
    if (currentURL.includes("/login")) {
      throw new Error("Login failed - still on login page");
    }

    // Wait for dashboard or onboarding to load by checking for specific elements
    try {
      // Try to wait for dashboard elements first
      await this.page.locator('[data-test-id="add-meal-button"]').waitFor({ timeout: 5000 });
      console.log("Successfully logged in - dashboard loaded");
    } catch {
      // If dashboard elements not found, check if we're on onboarding
      try {
        await this.page.locator('h1:has-text("Skonfiguruj swój profil")').waitFor({ timeout: 2000 });
        console.log("User redirected to onboarding");
      } catch {
        throw new Error("Neither dashboard nor onboarding loaded after login");
      }
    }
  }

  async isLoginFormVisible() {
    return await this.emailInput.isVisible();
  }
}
