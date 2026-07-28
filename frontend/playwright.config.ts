import "dotenv/config";
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  reporter: [["html", { open: "never" }]],
  // next dev JIT-compiles each route on its first request, which can push
  // an otherwise-fast test past the default 30s budget in CI — give real
  // headroom rather than relying on the route already being warm.
  timeout: 60_000,
  use: {
    baseURL: "http://localhost:3000",
    // Lore renders a desktop 3-panel layout and a mobile layout in the DOM
    // simultaneously (one hidden via CSS depending on viewport) — pin a
    // desktop-width viewport so locators aren't ambiguous between the two.
    viewport: { width: 1440, height: 900 },
  },
  webServer: {
    // In CI, test the production build (Next's own recommendation) —
    // avoids next dev's per-route JIT-compile-on-first-request cost, which
    // otherwise makes the first test in a run much slower than the rest.
    command: process.env.CI ? "pnpm build && pnpm start" : "pnpm dev",
    url: "http://localhost:3000",
    // Reuse a server you already have running locally for fast iteration,
    // but always start fresh in CI — standard Playwright convention.
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
