import { defineConfig, devices } from "@playwright/test";
import os from "node:os";
import path from "node:path";

const PORT = Number(process.env.E2E_PORT ?? 3100);
const BASE = `http://localhost:${PORT}`;
/** The tests get their own reservations file, emptied before each run (tests/global-setup.ts). */
export const E2E_RESERVATIONS = path.join(os.tmpdir(), "enginemarket-e2e-reservations.json");

export default defineConfig({
  testDir: "./tests",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  globalSetup: "./tests/global-setup.ts",
  use: {
    baseURL: BASE,
    trace: "retain-on-failure",
    // Uses the installed Google Chrome; set PW_CHANNEL="" to use Playwright's own Chromium instead.
    channel: process.env.PW_CHANNEL === "" ? undefined : (process.env.PW_CHANNEL ?? "chrome"),
  },
  projects: [{ name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 } } }],
  webServer: {
    command: `npm run build && npm run start -- -p ${PORT}`,
    url: BASE,
    timeout: 300_000,
    reuseExistingServer: !process.env.CI,
    env: { RESERVATIONS_FILE: E2E_RESERVATIONS, NEXT_TELEMETRY_DISABLED: "1" },
  },
});
