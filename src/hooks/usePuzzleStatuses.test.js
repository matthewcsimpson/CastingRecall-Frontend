import { renderHook } from "@testing-library/react";
import usePuzzleStatuses from "./usePuzzleStatuses";
import { getStoredGuessState } from "./useGuessState";

jest.mock("./useGuessState", () => ({
  getStoredGuessState: jest.fn(),
}));

describe("usePuzzleStatuses", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns empty object when puzzle list is missing", () => {
    const { result } = renderHook(() => usePuzzleStatuses(null));
    expect(result.current).toEqual({});
  });

  test("maps puzzle ids to solved, failed, in-progress, and not-attempted statuses", () => {
    const byId = {
      solved: { youWon: true, youLost: false, guesses: [] },
      failed: { youWon: false, youLost: true, guesses: [] },
      progress: { youWon: false, youLost: false, guesses: [{ id: 1 }] },
      notAttempted: { youWon: false, youLost: false, guesses: [] },
      parseError: { __err: true },
      absent: null,
    };

    getStoredGuessState.mockImplementation(
      (puzzleId) => byId[puzzleId] ?? null,
    );

    const puzzleList = [
      { puzzleId: "solved" },
      { puzzleId: "failed" },
      { puzzleId: "progress" },
      { puzzleId: "notAttempted" },
      { puzzleId: "parseError" },
      { puzzleId: "absent" },
    ];

    const { result } = renderHook(() => usePuzzleStatuses(puzzleList));

    expect(result.current).toEqual({
      solved: "solved",
      failed: "failed",
      progress: "in_progress",
      notAttempted: "not_attempted",
      parseError: "not_attempted",
      absent: "not_attempted",
    });
  });
});
