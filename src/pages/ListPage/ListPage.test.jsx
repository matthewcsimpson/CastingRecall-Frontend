import { render, screen } from "@testing-library/react";

vi.mock("../../hooks", () => ({
  usePuzzleList: vi.fn(),
  usePuzzleStatuses: vi.fn(),
}));

vi.mock("../../components", () => ({
  LoadingScreen: () => <div>LoadingScreen</div>,
  PuzzleListHeader: () => <div>PuzzleListHeader</div>,
  PuzzleListItem: ({ puzzleId, status }) => (
    <div>{`PuzzleListItem-${puzzleId}-${status}`}</div>
  ),
  SiteNav: ({ puzzleId, puzzleList }) => (
    <div>{`SiteNav-${puzzleId}-${puzzleList.length}`}</div>
  ),
}));

const { usePuzzleList, usePuzzleStatuses } = (await import("../../hooks"));
const ListPage = (await import("./ListPage")).default;

describe("ListPage integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders loading state while puzzle list is pending", () => {
    usePuzzleList.mockReturnValue({ data: null, isLoading: true });
    usePuzzleStatuses.mockReturnValue({});

    render(<ListPage />);

    expect(screen.getAllByText("LoadingScreen").length).toBeGreaterThan(0);
    expect(screen.queryByText("PuzzleListHeader")).not.toBeInTheDocument();
  });

  test("renders list header, nav, and puzzle items when data exists", () => {
    const puzzleList = [
      { puzzleId: "123", keyPeople: ["Tom Hanks"] },
      { puzzleId: "122", keyPeople: ["Meg Ryan"] },
    ];

    usePuzzleList.mockReturnValue({ data: puzzleList, isLoading: false });
    usePuzzleStatuses.mockReturnValue({
      123: "solved",
      122: "in_progress",
    });

    render(<ListPage />);

    expect(screen.getByText("SiteNav-list-2")).toBeInTheDocument();
    expect(screen.getByText("PuzzleListHeader")).toBeInTheDocument();
    expect(screen.getByText("PuzzleListItem-123-solved")).toBeInTheDocument();
    expect(
      screen.getByText("PuzzleListItem-122-in_progress"),
    ).toBeInTheDocument();
    expect(screen.queryByText("LoadingScreen")).not.toBeInTheDocument();
  });
});
