// import { type FullConfig } from "@playwright/test";

async function globalTeardown() {
  // Czyszczenie po testach e2e
  // console.log("Tearing down global test environment...");
  // Tutaj można dodać czyszczenie po testach
  // np. zatrzymanie serwera, czyszczenie bazy danych, itp.
}

export default globalTeardown;
