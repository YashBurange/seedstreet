import { expect, test } from "@playwright/test";

test.describe("SeedStreet demo", () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test("marketplace filters and renders without horizontal overflow", async ({ page }, testInfo) => {
    await expect(page.getByRole("heading", { name: "Are you a founder or an investor?" })).toBeVisible();
    await page.screenshot({ path: `test-results/${testInfo.project.name}-role-choice.png`, fullPage: true });
    await page.getByRole("link", { name: /Enter investor workspace/ }).click();
    await expect(page.getByRole("heading", { name: "Discover the next generation of startups" })).toBeVisible();
    await expect(page.getByText("Founder-led opportunities")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "List a Startup" })).toHaveCount(0);
    await expect(page.locator(".startup-card")).toHaveCount(15);
    await page.getByLabel("Filter by industry").selectOption("Aerospace");
    await expect(page.locator(".startup-card")).toHaveCount(2);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow).toBe(false);
    await page.screenshot({ path: `test-results/${testInfo.project.name}-marketplace.png`, fullPage: true });
    await page.goto("/investor/portfolio");
    await expect(page.getByText("Investor workspace")).toHaveCount(0);
    if (testInfo.project.name === "desktop") {
      const scrolls = await page.evaluate(() => document.documentElement.scrollHeight > window.innerHeight);
      expect(scrolls).toBe(false);
    }
  });

  test("investor offer, founder counter, gated meeting, and commitment", async ({ page }, testInfo) => {
    await page.getByRole("link", { name: /Enter investor workspace/ }).click();
    await page.goto("/startups/orbitalmesh");
    await page.getByLabel("Investment amount").fill("50000");
    await page.getByLabel("Proposed valuation").fill("4000000");
    await page.getByLabel("Message to founder").fill("Interested in the resilient connectivity thesis and pilot conversion plan.");
    await page.getByRole("button", { name: /Submit offer/ }).click();
    await expect(page.getByText("Offer sent to Maya Chen")).toBeVisible();
    await page.goto("/investor/portfolio");
    await page.getByRole("button", { name: /OrbitalMesh/ }).first().click();
    await expect(page.getByText("Offer conversation")).toBeVisible();
    await page.getByPlaceholder("Write a message").fill("Can you share the pilot conversion timeline?");
    await page.getByRole("button", { name: "Send message" }).click();

    await page.goto("/");
    await page.getByRole("link", { name: /Enter founder workspace/ }).click();
    await expect(page.getByText("Alex Morgan", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Can you share the pilot conversion timeline?")).toBeVisible();
    await page.screenshot({ path: `test-results/${testInfo.project.name}-founder-workspace.png`, fullPage: true });
    await page.getByLabel("Counter valuation").fill("5000000");
    await page.getByRole("button", { name: "Send counter" }).click();
    await page.goto("/founder/meetings");
    await page.getByRole("button", { name: /Alex Morgan/ }).first().click();
    await page.getByRole("button", { name: "Approve meeting" }).click();

    await page.goto("/");
    await page.getByRole("link", { name: /Enter investor workspace/ }).click();
    await page.goto("/investor/portfolio");
    await page.getByRole("button", { name: /OrbitalMesh/ }).first().click();
    await page.getByRole("button", { name: "Accept counteroffer" }).click();
    await page.goto("/investor/meetings");
    await page.getByRole("button", { name: /OrbitalMesh/ }).first().click();
    await page.getByRole("button", { name: /30 minute founder call/ }).first().click();
    await expect(page.getByText("Meeting confirmed")).toBeVisible();
    await page.goto("/investor/portfolio");
    await page.getByRole("button", { name: /OrbitalMesh/ }).first().click();
    await page.getByRole("button", { name: "Record commitment" }).click();
    await expect(page.getByText("Committed", { exact: true }).first()).toBeVisible();
  });

  test("founder editor updates the existing company profile", async ({ page }) => {
    await page.getByRole("link", { name: /Enter founder workspace/ }).click();
    await page.goto("/founder/list");
    await expect(page.getByLabel("Company name")).toHaveValue("OrbitalMesh");
    await page.getByLabel("Company name").fill("OrbitalMesh Labs");
    await page.getByLabel("One-line description").fill("Resilient satellite mesh networks for remote industrial operations.");
    for (let step = 0; step < 7; step += 1) {
      await page.getByRole("button", { name: /Continue/ }).click();
    }
    await expect(page.getByRole("heading", { name: "Review" })).toBeVisible();
    await page.getByRole("button", { name: /Save changes/ }).click();
    await expect(page.getByText("Profile updated")).toBeVisible();
    await page.getByRole("link", { name: /View company profile/ }).click();
    await expect(page.getByText("OrbitalMesh Labs", { exact: true })).toBeVisible();
  });
});
