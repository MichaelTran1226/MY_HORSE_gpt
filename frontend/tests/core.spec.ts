import { test, expect } from "@playwright/test";
async function login(page: import("@playwright/test").Page, role: string) {
  await page.goto("/login");
  await page
    .getByLabel("Email address")
    .fill(role.toLowerCase() + "@example.test");
  await page
    .getByLabel("Password", { exact: true })
    .fill("Test-only-password-2026");
  await page.getByRole("button", { name: "Sign in to workspace" }).click();
  await expect(page).toHaveURL(/\/app/);
}
test("all five roles reach their server-authenticated workspaces", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const role of [
    "CLUB_MANAGER",
    "HEAD_TRAINER",
    "VETERINARIAN",
    "GROOM",
    "HORSE_OWNER",
  ]) {
    await login(page, role);
    await expect(page.locator(".workspace-content h1")).toBeVisible();
    await page.getByRole("button", { name: "Sign out", exact: true }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Sign out", exact: true })
      .click();
    await expect(page).toHaveURL(/\/login/);
  }
  expect(errors).toEqual([]);
});
test("manager creates an owner and horse through the actual UI", async ({
  page,
}) => {
  await login(page, "CLUB_MANAGER");
  await page
    .getByRole("navigation")
    .getByRole("link", { name: /Staff accounts/ })
    .click();
  await page.getByText("Create staff / owner account", { exact: true }).click();
  await page
    .getByLabel("Full name", { exact: true })
    .fill("Browser test owner");
  await page
    .getByLabel("Email", { exact: true })
    .fill("browser-owner@example.test");
  await page.getByLabel("Initial password").fill("Browser-test-password-2026");
  await page.getByLabel("Role", { exact: true }).selectOption("HORSE_OWNER");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(
    page.getByRole("cell", { name: "Browser test owner", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: /Horse registry/ })
    .click();
  await page.getByText("Register a horse", { exact: true }).click();
  await page
    .getByLabel("Horse name", { exact: true })
    .fill("BROWSER TEST HORSE");
  await page.getByLabel("Chip / identification").fill("BROWSER-001");
  await page.getByLabel("Breed", { exact: true }).fill("Test breed");
  await page.getByLabel("Date of birth").fill("2020-01-01");
  await page.getByLabel("Coat color").fill("Bay");
  await page.getByLabel("Height (hands)").fill("15.2");
  await page.getByLabel("Weight (kg)").fill("490");
  await page
    .getByLabel("Owner", { exact: true })
    .selectOption({ label: "Browser test owner — browser-owner@example.test" });
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page
    .getByRole("button", { name: "Open BROWSER TEST HORSE", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "BROWSER TEST HORSE", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/manager-horse.png",
    fullPage: true,
  });
});
test("trainer schedules and completes a trial through the UI", async ({
  page,
}) => {
  await login(page, "HEAD_TRAINER");
  await page
    .getByRole("navigation")
    .getByRole("link", { name: /Training Plans/ })
    .click();
  await page
    .getByRole("button", { name: "Open BROWSER TEST HORSE", exact: true })
    .click();
  await page.getByText("Create training plan", { exact: true }).click();
  await page.getByLabel("Plan title").fill("Browser training plan");
  await page
    .getByLabel("Objective", { exact: true })
    .fill("Record a complete training workflow");
  await page.getByLabel("Distance (m)").fill("1200");
  await page.getByLabel("Start", { exact: true }).fill("2026-09-01T08:00");
  await page.getByLabel("End", { exact: true }).fill("2026-10-01T18:00");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page.getByLabel("Session date / time").fill("2026-09-24T09:00");
  await page
    .getByLabel("Assigned groom / trainer")
    .selectOption({ label: "GROOM" });
  await page
    .getByRole("button", { name: "Schedule session", exact: true })
    .click();
  await page
    .getByText("Record assessment / trial run", { exact: true })
    .click();
  await page.getByLabel("Trainer assessment").fill("Browser trial completed");
  await page.getByLabel("Performance rating (1–10)").fill("8");
  await page.getByLabel("Trial finish time (seconds)").fill("85.2");
  await page.getByLabel("Maximum speed (km/h)").fill("54");
  await page.getByLabel("Pre-exercise heart rate").fill("40");
  await page.getByLabel("Post-exercise heart rate").fill("130");
  await page
    .getByRole("button", { name: "Complete session", exact: true })
    .click();
  await expect(
    page.getByText("Browser trial completed", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText(/Time 85.2s/)).toBeVisible();
});
test("veterinarian records a 2D injury through the UI", async ({ page }) => {
  await login(page, "VETERINARIAN");
  await page
    .getByRole("navigation")
    .getByRole("link", { name: /Injury tracking/ })
    .click();
  await page
    .getByRole("button", { name: "Open BROWSER TEST HORSE", exact: true })
    .click();
  await page.getByText("Record examination & injury", { exact: true }).click();
  await page
    .getByLabel("Diagnosis", { exact: true })
    .fill("Browser test examination");
  await page
    .getByLabel("Treatment plan", { exact: true })
    .fill("Monitor recovery");
  await page.getByLabel("Exam health status").selectOption("INJURED");
  await page
    .getByRole("button", { name: "Select foreleg", exact: true })
    .click();
  await expect(page.getByLabel("foreleg", { exact: true })).toBeChecked();
  await page.getByLabel("Injury severity").selectOption("MILD");
  await page
    .getByLabel("Injury / recovery notes")
    .fill("Browser test injury location");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(
    page.getByText("FORELEG · MILD · Browser test injury location"),
  ).toBeVisible();
  await expect(
    page.getByText(/Training locked: Browser test examination/),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/veterinary-record.png",
    fullPage: true,
  });
});
test("mobile owner view stays within viewport and isolates other owners", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page, "HORSE_OWNER");
  await page.getByRole("button", { name: "Toggle navigation" }).click();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: /My Horses/ })
    .click();
  await expect(
    page.getByRole("button", { name: "Open TEST horse", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Open BROWSER TEST HORSE", exact: true }),
  ).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/owner-mobile.png",
    fullPage: true,
  });
});
