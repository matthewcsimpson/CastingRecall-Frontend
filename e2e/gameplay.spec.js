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

const puzzleMovies = [
  makeMovie(1, "Valid Movie"),
  makeMovie(2, "Backup Movie"),
  makeMovie(3, "Third Movie"),
  makeMovie(4, "Fourth Movie"),
  makeMovie(5, "Fifth Movie"),
  makeMovie(6, "Sixth Movie"),
];

const latestPuzzle = {
  puzzleId: "123",
  keyPeople: ["Tom Hanks", "Meg Ryan"],
  puzzle: puzzleMovies,
};

const oldPuzzle = {
  puzzleId: "122",
  keyPeople: ["Tom Cruise", "Nicole Kidman"],
  puzzle: [makeMovie(7, "Older Movie")],
};

const searchResults = [
  ...puzzleMovies.map((movie) => ({
    id: movie.id,
    title: movie.title,
    poster_path: null,
    original_language: "en",
    release_date: "2001-05-20",
    genre_ids: [18],
  })),
  {
    id: 999,
    title: "Wrong Movie",
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
];

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
        results: searchResults,
      }),
    });
  });
});

test("persists spent hint after reload", async ({ page }) => {
  await page.goto("/");

  await page.getByText("pssst....need a hint?").first().click();
  await page.getByRole("button", { name: "Director" }).first().click();

  await expect(page.getByText("💡 Hint used")).toBeVisible();

  await page.reload();

  await page.getByText("pssst....need a hint?").first().click();
  await expect(
    page.getByRole("button", { name: "Director" }).first(),
  ).toBeDisabled();
});

test("shows win outcome after six correct guesses", async ({ page }) => {
  await page.goto("/");

  const input = page.getByRole("textbox");

  for (const movie of puzzleMovies) {
    await input.fill(movie.title);
    await page.waitForTimeout(400);
    await page.getByRole("button", { name: movie.title }).click();
  }

  await expect(page.getByText("Congrats! You won!")).toBeVisible();
});

test("shows loss outcome after max wrong guesses", async ({ page }) => {
  await page.goto("/");

  const input = page.getByRole("textbox");

  for (let index = 0; index < 10; index += 1) {
    await input.fill("Wrong");
    await page.waitForTimeout(400);
    await page.getByRole("button", { name: "Wrong Movie" }).click();
  }

  await expect(page.getByText("You didn't get this one!")).toBeVisible();
});
