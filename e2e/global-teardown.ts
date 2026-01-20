import { spawn } from "child_process";

async function globalTeardown() {
  // Czyszczenie po testach e2e
  console.log("Stopping development server...");

  // Zatrzymaj serwer deweloperski
  const serverPid = process.env.DEV_SERVER_PID;
  if (serverPid) {
    try {
      if (process.platform === "win32") {
        spawn("taskkill", ["/pid", serverPid, "/t", "/f"], { stdio: "inherit" });
      } else {
        process.kill(parseInt(serverPid), "SIGTERM");
      }
      console.log("Development server stopped");
    } catch (error) {
      console.log("Error stopping development server:", error);
    }
  }

  // Dodatkowe czyszczenie po testach
  // np. czyszczenie bazy danych testowej, itp.
}

export default globalTeardown;
