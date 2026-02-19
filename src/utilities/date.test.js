import { formatDate, YEAR_ONLY_DATE_OPTIONS } from "./date";

describe("date utilities", () => {
  test("formatDate returns year with YEAR_ONLY_DATE_OPTIONS", () => {
    const noonUtcTimestamp = Date.UTC(2020, 0, 1, 12, 0, 0);
    expect(formatDate(noonUtcTimestamp, YEAR_ONLY_DATE_OPTIONS)).toBe("2020");
  });
});
