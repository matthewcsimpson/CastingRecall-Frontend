import { render, screen } from "@testing-library/react";

jest.mock(
  "react-router-dom",
  () => ({
    Link: ({ to, className, children }) => (
      <a href={to} className={className}>
        {children}
      </a>
    ),
  }),
  { virtual: true },
);

const SiteHeader = require("./SiteHeader").default;

describe("SiteHeader", () => {
  test("renders the title linking home", () => {
    render(<SiteHeader />);

    expect(screen.getByRole("link", { name: "Casting ReCall" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  test("renders the subtitle", () => {
    render(<SiteHeader />);

    expect(
      screen.getByText(/Can you guess the six films/i),
    ).toBeInTheDocument();
  });
});
