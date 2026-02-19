import { render, screen } from "@testing-library/react";
import App from "./App";

jest.mock(
  "react-router-dom",
  () => {
    const Route = jest.fn(() => null);

    return {
      BrowserRouter: ({ children }) => (
        <div data-testid="browser-router">{children}</div>
      ),
      Routes: ({ children }) => <div data-testid="routes">{children}</div>,
      Route,
    };
  },
  { virtual: true },
);

jest.mock("./components", () => ({
  SiteHeader: () => <div>SiteHeader</div>,
  SiteFooter: () => <div>SiteFooter</div>,
}));

jest.mock("./pages/GamePage/GamePage", () => {
  const MockGamePage = () => <div>GamePage</div>;
  return { __esModule: true, default: MockGamePage };
});

jest.mock("./pages/ListPage/ListPage", () => {
  const MockListPage = () => <div>ListPage</div>;
  return { __esModule: true, default: MockListPage };
});

const { Route } = require("react-router-dom");
const GamePage = require("./pages/GamePage/GamePage").default;
const ListPage = require("./pages/ListPage/ListPage").default;

describe("App route wiring", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders site frame and defines expected routes", () => {
    render(<App />);

    expect(screen.getByText("SiteHeader")).toBeInTheDocument();
    expect(screen.getByText("SiteFooter")).toBeInTheDocument();

    expect(Route).toHaveBeenCalledTimes(4);

    const calls = Route.mock.calls.map(([props]) => props);

    expect(calls[0].path).toBe("/");
    expect(calls[0].element.type).toBe(GamePage);

    expect(calls[1].path).toBe("/puzzle/:puzzleId");
    expect(calls[1].element.type).toBe(GamePage);

    expect(calls[2].path).toBe("/puzzle/list");
    expect(calls[2].element.type).toBe(ListPage);

    expect(calls[3].path).toBe("*");
    expect(calls[3].element.type).toBe(GamePage);
  });
});
