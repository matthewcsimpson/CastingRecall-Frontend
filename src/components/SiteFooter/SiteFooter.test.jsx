import { render, screen } from "@testing-library/react";
import SiteFooter from "./SiteFooter";

describe("SiteFooter", () => {
  test("renders the author attribution link", () => {
    render(<SiteFooter />);

    expect(screen.getByRole("link", { name: "Matthew Simpson" })).toHaveAttribute(
      "href",
      "https://matthewcsimpson.dev",
    );
  });

  test("renders the Ko-fi support link and TMDB attribution", () => {
    render(<SiteFooter />);

    expect(
      screen.getByRole("link", { name: "Buy Me a Coffee at ko-fi.com" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/uses the TMDB API, but is not endorsed/i),
    ).toBeInTheDocument();
  });
});
