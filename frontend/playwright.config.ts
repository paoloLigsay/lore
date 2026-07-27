import "dotenv/config";
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  use: {
    baseURL: "http://localhost:3000",
    // Lore renders a desktop 3-panel layout and a mobile layout in the DOM
    // simultaneously (one hidden via CSS depending on viewport) — pin a
    // desktop-width viewport so locators aren't ambiguous between the two.
    viewport: { width: 1440, height: 900 },
  },
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    // Reuse a server you already have running locally for fast iteration,
    // but always start fresh in CI — standard Playwright convention.
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
