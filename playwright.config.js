const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: "BROWSER=none npm start",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: true,
    timeout: 120_000,
    env: {
      CI: "true",
      REACT_APP_API_REMOTE_URL: "http://127.0.0.1:3000/api",
      REACT_APP_TMDB_GENRE_DETAILS: "http://127.0.0.1:3000/tmdb/genres",
      REACT_APP_TMDB_MOVIE_SEARCH_URL: "http://127.0.0.1:3000/tmdb/search",
      REACT_APP_TMDB_TOKEN: "playwright-token",
      REACT_APP_TMDB_LOWEST_YEAR: "1980",
      REACT_APP_TMDB_IMG_BASE: "https://image.tmdb.org/t/p/w500",
    },
  },
  projects: [
    {
      name: "chromium",
      use: {
        browserName: "chromium",
      },
    },
  ],
});
