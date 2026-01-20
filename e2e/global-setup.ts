import { spawn } from "child_process";

async function globalSetup() {
  // Uruchom serwer deweloperski przed testami e2e na stałym porcie
  console.log("Starting development server for E2E tests...");

  // Uruchom npm run dev na porcie 4322 (żeby uniknąć konfliktów)
  const serverProcess = spawn("npm", ["run", "dev", "--", "--port", "4322"], {
    stdio: "inherit",
    shell: true,
    env: { ...process.env, NODE_ENV: "test" },
  });

  // Czekaj chwilę na uruchomienie serwera
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // Zapisz PID procesu serwera, żeby móc go zatrzymać w teardown
  process.env.DEV_SERVER_PID = serverProcess.pid?.toString();
  process.env.BASE_URL = "http://localhost:4322";

  console.log("Development server started on port 4322, PID:", serverProcess.pid);

  // Nie czekaj na zakończenie procesu - powinien działać w tle
  serverProcess.unref();
}

export default globalSetup;
