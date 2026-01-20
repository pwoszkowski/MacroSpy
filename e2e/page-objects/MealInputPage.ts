import { Page, Locator } from "@playwright/test";

export class MealInputPage {
  readonly page: Page;
  readonly mealDescriptionInput: Locator;
  readonly analyzeMealButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.mealDescriptionInput = page.locator('[data-test-id="meal-description-input"]');
    this.analyzeMealButton = page.locator('[data-test-id="analyze-meal-button"]');
  }

  async fillMealDescription(description: string) {
    await this.mealDescriptionInput.fill(description);
  }

  async clickAnalyzeMealButton() {
    await this.analyzeMealButton.click();
  }

  async isMealDescriptionInputVisible() {
    return await this.mealDescriptionInput.isVisible();
  }

  async isAnalyzeMealButtonVisible() {
    return await this.analyzeMealButton.isVisible();
  }

  async waitForAnalysisLoadingView() {
    await this.page.locator('[data-test-id="analysis-loading-view"]').waitFor();
  }
}