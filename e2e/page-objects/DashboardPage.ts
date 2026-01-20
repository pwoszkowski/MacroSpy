import { Page, Locator } from "@playwright/test";

export class DashboardPage {
  readonly page: Page;
  readonly addMealButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addMealButton = page.locator('[data-test-id="add-meal-button"]');
  }

  async goto() {
    await this.page.goto("/");
  }

  async clickAddMealButton() {
    await this.addMealButton.click();
  }

  async isAddMealButtonVisible() {
    return await this.addMealButton.isVisible();
  }
}