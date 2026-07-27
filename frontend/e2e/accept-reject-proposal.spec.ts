import { test, expect, type Page } from "@playwright/test";
import { resolveTestUserId, seedPendingProposal, cleanupLore } from "./seed-proposal";

const TEST_EMAIL = "paolomartinligsay@gmail.com";
const TEST_PASSWORD = process.env.PW!;

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(TEST_EMAIL);
  await page.getByLabel("Password").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForURL("**/dashboard");
}

test.describe("Proposal accept/reject invariant", () => {
  test("accepting a pending proposal applies it to the note", async ({ page, request }) => {
    const userId = await resolveTestUserId(request, TEST_EMAIL, TEST_PASSWORD);
    const { loreId } = seedPendingProposal({
      userId,
      email: TEST_EMAIL,
      noteBefore: "Original note content.",
      noteAfter: "Updated note content from the proposal.",
    });

    try {
      await login(page);
      await page.goto(`/lore/${loreId}`);

      await expect(page.getByText("Reviewing proposed changes").first()).toBeVisible();
      await page.getByRole("button", { name: "Accept" }).first().click();

      await expect(
        page.getByText("Updated note content from the proposal.").first()
      ).toBeVisible();
      await expect(page.getByText(/Accepted changes to/)).toBeVisible();
    } finally {
      cleanupLore(loreId);
    }
  });

  test("rejecting a pending proposal leaves the note untouched", async ({ page, request }) => {
    const userId = await resolveTestUserId(request, TEST_EMAIL, TEST_PASSWORD);
    const { loreId } = seedPendingProposal({
      userId,
      email: TEST_EMAIL,
      noteBefore: "Original note content, unchanged.",
      noteAfter: "This edit should never be applied.",
    });

    try {
      await login(page);
      await page.goto(`/lore/${loreId}`);

      await expect(page.getByText("Reviewing proposed changes").first()).toBeVisible();
      await page.getByRole("button", { name: "Reject" }).first().click();

      await expect(
        page.getByText("Original note content, unchanged.").first()
      ).toBeVisible();
      await expect(page.getByText(/Rejected changes to/)).toBeVisible();
    } finally {
      cleanupLore(loreId);
    }
  });
});
