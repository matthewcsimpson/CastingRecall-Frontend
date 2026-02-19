import { formatGenre } from "./genres";

describe("genre utilities", () => {
  test("formatGenre resolves a known genre name", () => {
    const genres = [
      { id: 18, name: "Drama" },
      { id: 35, name: "Comedy" },
    ];

    expect(formatGenre(35, genres)).toBe("Comedy");
  });

  test("formatGenre returns Unknown when data is missing", () => {
    expect(formatGenre(99, [{ id: 18, name: "Drama" }])).toBe("Unknown");
    expect(formatGenre(18, null)).toBe("Unknown");
  });
});
