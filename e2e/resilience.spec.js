const { test, expect } = require("@playwright/test");

const makeMovie = (id, title) => ({
  id,
  title,
  original_title: title,
  release_date: "1999-10-15",
  overview: `${title} overview`,
  poster_path: null,
  genre_ids: [18],
  directors: [{ id: id * 10, name: `Director ${id}` }],
  cast: [
    {
      id: id * 100,
      name: `Actor ${id}`,
      character: `Character ${id}`,
      profile_path: null,
    },
  ],
});

const latestPuzzle = {
  puzzleId: "123",
  keyPeople: ["Tom Hanks", "Meg Ryan"],
  puzzle: [makeMovie(1, "Valid Movie")],
};

const puzzleListPayload = {
  puzzles: [{ puzzleId: "123", keyPeople: ["Tom Hanks", "Meg Ryan"] }],
};

test("handles puzzle API failure without crashing", async ({ page }) => {
  await page.route("**/puzzle/list", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(puzzleListPayload),
    });
  });

  await page.route("**/puzzle/*", async (route) => {
    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ message: "Server error" }),
    });
  });

  await page.route("**/genre/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ genres: [{ id: 18, name: "Drama" }] }),
    });
  });

  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: /casting recall/i }),
  ).toBeVisible();
  await expect(page.locator("body")).toBeVisible();
  await expect(page.getByRole("textbox")).toHaveCount(0);
  await expect(page.getByText("Starring:")).toHaveCount(0);
});

test("handles TMDB search failure and keeps app usable", async ({ page }) => {
  await page.route("**/puzzle/list", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(puzzleListPayload),
    });
  });

  await page.route("**/puzzle/*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(latestPuzzle),
    });
  });

  await page.route("**/genre/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ genres: [{ id: 18, name: "Drama" }] }),
    });
  });

  await page.route("**/search/**", async (route) => {
    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ message: "Search failed" }),
    });
  });

  await page.goto("/");

  const input = page.getByRole("textbox");
  await expect(input).toBeVisible();

  await input.fill("Valid");
  await page.waitForTimeout(400);

  await expect(page.getByRole("button", { name: "Valid Movie" })).toHaveCount(
    0,
  );
  await expect(input).toHaveValue("Valid");
  await expect(page.getByText("Starring:").first()).toBeVisible();
});

test("recovers from corrupted localStorage guess state", async ({ page }) => {
  await page.route("**/puzzle/list", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(puzzleListPayload),
    });
  });

  await page.route("**/puzzle/*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(latestPuzzle),
    });
  });

  await page.route("**/genre/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ genres: [{ id: 18, name: "Drama" }] }),
    });
  });

  await page.addInitScript(() => {
    window.localStorage.setItem("123", "{bad-json");
  });

  await page.goto("/");

  await expect(page.getByRole("textbox")).toBeVisible();
  await expect(page.getByText("Puzzle List")).toBeVisible();
  await expect(page.getByText("Starring:").first()).toBeVisible();
  await expect(page.getByText("✅ Valid Movie")).toHaveCount(0);
});
