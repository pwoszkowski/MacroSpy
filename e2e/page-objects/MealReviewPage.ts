import { Page, Locator } from "@playwright/test";

export class MealReviewPage {
  readonly page: Page;
  readonly mealReviewView: Locator;
  readonly saveMealButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.mealReviewView = page.locator('[data-test-id="meal-review-view"]');
    this.saveMealButton = page.locator('[data-test-id="save-meal-button"]');
  }

  async isMealReviewViewVisible() {
    return await this.mealReviewView.isVisible();
  }

  async clickSaveMealButton() {
    await this.saveMealButton.click();
  }

  async isSaveMealButtonVisible() {
    return await this.saveMealButton.isVisible();
  }

  async waitForMealReviewView() {
    await this.mealReviewView.waitFor();
  }
}