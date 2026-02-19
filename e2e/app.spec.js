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
  puzzle: [makeMovie(1, "Valid Movie"), makeMovie(2, "Backup Movie")],
};

const oldPuzzle = {
  puzzleId: "122",
  keyPeople: ["Tom Cruise", "Nicole Kidman"],
  puzzle: [makeMovie(3, "Older Movie")],
};

test.beforeEach(async ({ page }) => {
  await page.route("**/puzzle/list", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        puzzles: [
          { puzzleId: "123", keyPeople: ["Tom Hanks", "Meg Ryan"] },
          { puzzleId: "122", keyPeople: ["Tom Cruise", "Nicole Kidman"] },
        ],
      }),
    });
  });

  await page.route("**/puzzle/*", async (route) => {
    const url = route.request().url();

    const payload =
      url.endsWith("/latest") || url.endsWith("/123")
        ? latestPuzzle
        : oldPuzzle;

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(payload),
    });
  });

  await page.route("**/genre/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        genres: [{ id: 18, name: "Drama" }],
      }),
    });
  });

  await page.route("**/search/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        results: [
          {
            id: 1,
            title: "Valid Movie",
            poster_path: null,
            original_language: "en",
            release_date: "2001-05-20",
            genre_ids: [18],
          },
          {
            id: 44,
            title: "Filtered Documentary",
            poster_path: null,
            original_language: "en",
            release_date: "2002-08-01",
            genre_ids: [99],
          },
        ],
      }),
    });
  });
});

test("loads game shell on home route", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("textbox")).toBeVisible();
  await expect(page.getByText("Puzzle List")).toBeVisible();
  await expect(page.getByText("Starring:").first()).toBeVisible();
});

test("navigates to puzzle list and shows puzzle entries", async ({ page }) => {
  await page.goto("/");

  await page
    .getByRole("link", { name: /puzzle list/i })
    .first()
    .click();

  await expect(
    page.getByText("Puzzle Name", { exact: true }).first(),
  ).toBeVisible();
  await expect(page.getByText("Tom")).toBeVisible();
  await expect(page.getByText("Nicole")).toBeVisible();
});

test("submits a suggestion and records a correct guess", async ({ page }) => {
  await page.goto("/");

  const input = page.getByRole("textbox");
  await input.fill("Valid");
  await page.waitForTimeout(400);

  await expect(page.getByRole("button", { name: "Valid Movie" })).toBeVisible();
  await expect(page.getByText("Filtered Documentary")).toHaveCount(0);

  await page.getByRole("button", { name: "Valid Movie" }).click();

  await expect(page.getByText("✅ Valid Movie")).toBeVisible();
  await expect(input).toHaveValue("");
});
