import { Page, Locator } from "@playwright/test";

export class AddMealDialog {
  readonly page: Page;
  readonly dialog: Locator;
  readonly mealDescriptionInput: Locator;
  readonly analyzeMealButton: Locator;
  readonly saveMealButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dialog = page.locator('[data-test-id="add-meal-dialog"]');
    this.mealDescriptionInput = page.locator('[data-test-id="meal-description-input"]');
    this.analyzeMealButton = page.locator('[data-test-id="analyze-meal-button"]');
    this.saveMealButton = page.locator('[data-test-id="save-meal-button"]');
  }

  async isDialogVisible() {
    return await this.dialog.isVisible();
  }

  async fillMealDescription(description: string) {
    await this.mealDescriptionInput.fill(description);
  }

  async clickAnalyzeMealButton() {
    await this.analyzeMealButton.click();
  }

  async clickSaveMealButton() {
    await this.saveMealButton.click();
  }

  async isMealDescriptionInputVisible() {
    return await this.mealDescriptionInput.isVisible();
  }

  async isAnalyzeMealButtonVisible() {
    return await this.analyzeMealButton.isVisible();
  }

  async isSaveMealButtonVisible() {
    return await this.saveMealButton.isVisible();
  }

  async waitForAnalysisLoading() {
    await this.page.locator('[data-test-id="analysis-loading-view"]').waitFor();
  }

  async waitForMealReviewView() {
    await this.page.locator('[data-test-id="meal-review-view"]').waitFor();
  }
}
