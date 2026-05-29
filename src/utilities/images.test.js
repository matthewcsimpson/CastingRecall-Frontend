import { tmdbImageUrl } from "./images";

describe("tmdbImageUrl", () => {
  test("prepends the TMDB base to a relative path", () => {
    const url = tmdbImageUrl("/poster.jpg");

    expect(url).toMatch(/^https?:\/\//);
    expect(url.endsWith("/poster.jpg")).toBe(true);
  });

  test("returns the provided fallback when path is missing", () => {
    expect(tmdbImageUrl(null, { fallback: "placeholder.jpg" })).toBe(
      "placeholder.jpg",
    );
    expect(tmdbImageUrl(undefined, { fallback: "placeholder.jpg" })).toBe(
      "placeholder.jpg",
    );
    expect(tmdbImageUrl("", { fallback: "placeholder.jpg" })).toBe(
      "placeholder.jpg",
    );
  });

  test("defaults the fallback to an empty string", () => {
    expect(tmdbImageUrl(null)).toBe("");
    expect(tmdbImageUrl(undefined)).toBe("");
  });
});
