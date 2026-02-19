import { fireEvent, render, screen } from "@testing-library/react";

const siteNavItemCalls = [];

jest.mock("../SiteNavItem/SiteNavItem.jsx", () => ({
  __esModule: true,
  default: (props) => {
    siteNavItemCalls.push(props);
    return (
      <button
        type="button"
        onClick={props.onClick}
        data-label={props.label}
        data-disabled={String(Boolean(props.disabled))}
        data-to={props.to || ""}
      >
        {props.label}
      </button>
    );
  },
}));

jest.mock("../HowToPlayModal/HowToPlayModal.jsx", () => ({
  __esModule: true,
  default: ({ isOpen, onClose }) => (
    <div>
      <span>{isOpen ? "HowTo-Open" : "HowTo-Closed"}</span>
      <button type="button" onClick={onClose}>
        Close HowTo
      </button>
    </div>
  ),
}));

const SiteNav = require("./SiteNav").default;

const puzzleList = [
  { puzzleId: "123" },
  { puzzleId: "122" },
  { puzzleId: "121" },
];

describe("SiteNav", () => {
  beforeEach(() => {
    siteNavItemCalls.length = 0;
    document.body.style.overflow = "";
  });

  test("does not render nav links when puzzle list is empty", () => {
    render(<SiteNav puzzleId="123" puzzleList={[]} />);

    expect(
      screen.queryByRole("button", { name: "Previous" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("HowTo-Closed")).toBeInTheDocument();
  });

  test("computes previous and next targets for a middle puzzle id", () => {
    render(<SiteNav puzzleId="122" puzzleList={puzzleList} />);

    const previousCall = siteNavItemCalls.find(
      (props) => props.label === "Previous",
    );
    const nextCall = siteNavItemCalls.find((props) => props.label === "Next");

    expect(previousCall.to).toBe("/puzzle/121");
    expect(previousCall.disabled).toBe(false);

    expect(nextCall.to).toBe("/puzzle/123");
    expect(nextCall.disabled).toBe(false);
  });

  test("disables previous and next in list view", () => {
    render(<SiteNav puzzleId="list" puzzleList={puzzleList} />);

    const previousCall = siteNavItemCalls.find(
      (props) => props.label === "Previous",
    );
    const nextCall = siteNavItemCalls.find((props) => props.label === "Next");

    expect(previousCall.disabled).toBe(true);
    expect(nextCall.disabled).toBe(true);
  });

  test("opens and closes how-to modal and restores body overflow", () => {
    const { unmount } = render(
      <SiteNav puzzleId="122" puzzleList={puzzleList} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "How to Play" }));
    expect(screen.getByText("HowTo-Open")).toBeInTheDocument();
    expect(document.body.style.overflow).toBe("hidden");

    fireEvent.click(screen.getByRole("button", { name: "Close HowTo" }));
    expect(screen.getByText("HowTo-Closed")).toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");

    fireEvent.click(screen.getByRole("button", { name: "How to Play" }));
    expect(document.body.style.overflow).toBe("hidden");

    unmount();
    expect(document.body.style.overflow).toBe("");
  });
});
