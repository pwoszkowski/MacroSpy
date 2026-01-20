import { test, expect } from "@playwright/test";
import { DashboardPage, AddMealDialog, LoginPage } from "./page-objects";

test.describe("Add Meal Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Przejdź do aplikacji - serwer powinien być już uruchomiony przez global-setup
    await page.goto("/");
  });

  test("should complete full meal addition flow", async ({ page }) => {
    test.setTimeout(120000); // 2 minuty dla całego testu z powodu analizy AI
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const addMealDialog = new AddMealDialog(page);

    // 1. Sprawdź przekierowanie na login gdy użytkownik nie jest zalogowany
    await page.waitForURL("/login");
    await expect(page).toHaveURL("/login");

    // 2. Zaloguj użytkownika testowego
    await loginPage.login(process.env.E2E_USERNAME || "", process.env.E2E_PASSWORD || "");

    // 3. Sprawdź czy użytkownik został przekierowany na dashboard lub onboarding
    await page.waitForURL(/\/$|\/onboarding$/, { timeout: 15000 });
    const currentURL = page.url();

    if (currentURL.includes("/onboarding")) {
      // Jeśli użytkownik nie przeszedł onboarding, pomiń ten test
      test.skip();
      return;
    }

    // Powinniśmy być na dashboard
    await expect(page).toHaveURL("/");

    // 4. Sprawdź czy przycisk dodawania posiłku jest widoczny
    await expect(dashboardPage.addMealButton).toBeVisible();

    // 5. Kliknij przycisk dodawania posiłku
    await dashboardPage.clickAddMealButton();

    // 6. Sprawdź czy dialog dodawania posiłku się otworzył
    await expect(addMealDialog.dialog).toBeVisible();

    // 7. Sprawdź czy pole wprowadzania posiłku jest widoczne
    await expect(addMealDialog.mealDescriptionInput).toBeVisible();

    // 8. Wprowadź opis posiłku
    const mealDescription = "Zjadłem dużą pizzę margherita z dodatkowym serem";
    await addMealDialog.fillMealDescription(mealDescription);

    // 9. Sprawdź czy opis został wprowadzony
    await expect(addMealDialog.mealDescriptionInput).toHaveValue(mealDescription);

    // 10. Sprawdź czy przycisk analizy jest widoczny i kliknij go
    await expect(addMealDialog.analyzeMealButton).toBeVisible();
    await addMealDialog.clickAnalyzeMealButton();

    // 11. Czekaj na widok ładowania analizy
    await addMealDialog.waitForAnalysisLoading();

    // 12. Czekaj na widok przeglądu posiłku (z dłuższym timeout dla analizy AI)
    await addMealDialog.waitForMealReviewView({ timeout: 60000 }); // 60 sekund na analizę AI

    // 13. Sprawdź czy przycisk zapisywania posiłku jest widoczny
    await expect(addMealDialog.saveMealButton).toBeVisible();

    // 14. Zapisz posiłek
    await addMealDialog.clickSaveMealButton();

    // 15. Czekaj na zamknięcie dialogu i powrót do dashboard
    await page.waitForTimeout(2000); // Czekaj na przetworzenie zapisu

    // 16. Sprawdź czy dialog został zamknięty
    await expect(addMealDialog.dialog).not.toBeVisible();
  });
});
