import { render, screen } from "@testing-library/react";
import App from "./App";

vi.mock(
  "react-router-dom",
  () => {
    const Route = vi.fn(() => null);

    return {
      BrowserRouter: ({ children }) => (
        <div data-testid="browser-router">{children}</div>
      ),
      Routes: ({ children }) => <div data-testid="routes">{children}</div>,
      Route,
    };
  });

vi.mock("./components", () => ({
  SiteHeader: () => <div>SiteHeader</div>,
  SiteFooter: () => <div>SiteFooter</div>,
}));

vi.mock("./pages/GamePage/GamePage", () => {
  const MockGamePage = () => <div>GamePage</div>;
  return { __esModule: true, default: MockGamePage };
});

vi.mock("./pages/ListPage/ListPage", () => {
  const MockListPage = () => <div>ListPage</div>;
  return { __esModule: true, default: MockListPage };
});

const { Route } = (await import("react-router-dom"));
const GamePage = (await import("./pages/GamePage/GamePage")).default;
const ListPage = (await import("./pages/ListPage/ListPage")).default;

describe("App route wiring", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
