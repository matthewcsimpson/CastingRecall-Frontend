import { fireEvent, render, screen } from "@testing-library/react";

jest.mock(
  "react-router-dom",
  () => ({
    NavLink: ({ to, className, children }) => (
      <a href={to} className={className}>
        {children}
      </a>
    ),
  }),
  { virtual: true },
);

const SiteNavItem = require("./SiteNavItem").default;

describe("SiteNavItem", () => {
  test("renders a link to `to` when given a non-empty path", () => {
    render(<SiteNavItem to="/puzzle/123" label="Next" />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/puzzle/123");
    expect(link).toHaveTextContent("Next");
  });

  test("renders a button that calls onClick when there is no path", () => {
    const onClick = jest.fn();
    render(<SiteNavItem label="How to Play" onClick={onClick} />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "How to Play" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("treats an empty-string path as a button, not a link", () => {
    render(<SiteNavItem to="" label="Next" onClick={jest.fn()} />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
  });

  test("disables the button and applies the inactive class when disabled", () => {
    render(<SiteNavItem label="Previous" disabled={true} onClick={jest.fn()} />);

    const button = screen.getByRole("button", { name: "Previous" });
    expect(button).toBeDisabled();
    expect(button.className).toContain("nav__item--inactivelink");
  });

  test("renders the icon when provided", () => {
    render(<SiteNavItem label="Help" icon={<span>★</span>} onClick={jest.fn()} />);

    expect(screen.getByText("★")).toBeInTheDocument();
  });

  test("sets aria-haspopup on a button with an onClick handler", () => {
    render(<SiteNavItem label="How to Play" onClick={jest.fn()} />);

    expect(screen.getByRole("button", { name: "How to Play" })).toHaveAttribute(
      "aria-haspopup",
      "dialog",
    );
  });

  test("omits aria-haspopup on a button without an onClick handler", () => {
    render(<SiteNavItem label="Inert" />);

    expect(
      screen.getByRole("button", { name: "Inert" }),
    ).not.toHaveAttribute("aria-haspopup");
  });
});
