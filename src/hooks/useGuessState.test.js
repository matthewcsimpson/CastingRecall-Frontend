import { renderHook, act, waitFor } from "@testing-library/react";
import useGuessState, { getStoredGuessState } from "./useGuessState";
import { loadLocalJson, saveLocalJson } from "../utilities";
import { MOVIES_PER_PUZZLE } from "../constants/config";

jest.mock("../utilities", () => ({
  loadLocalJson: jest.fn(),
  saveLocalJson: jest.fn(),
}));

const buildPuzzle = () =>
  Array.from({ length: MOVIES_PER_PUZZLE }).map((_, index) => ({
    id: index + 1,
    title: `Movie ${index + 1}`,
  }));

describe("getStoredGuessState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns null when puzzle id is missing", () => {
    expect(getStoredGuessState()).toBeNull();
  });

  test("returns error marker when JSON parsing fails", () => {
    loadLocalJson.mockImplementation((_key, _fallback, { onError }) => {
      onError(new Error("parse error"));
      return null;
    });

    expect(getStoredGuessState("abc")).toEqual({ __err: true });
  });

  test("returns null when stored id does not match puzzle id", () => {
    loadLocalJson.mockReturnValue({ id: "other", guesses: [] });

    expect(getStoredGuessState("abc")).toBeNull();
  });

  test("returns stored state when ids match", () => {
    const stored = { id: "abc", guesses: [], youWon: false, youLost: false };
    loadLocalJson.mockReturnValue(stored);

    expect(getStoredGuessState("abc")).toEqual(stored);
  });
});

describe("useGuessState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    loadLocalJson.mockReturnValue(null);
  });

  test("tracks correct and incorrect guesses", () => {
    const puzzleData = { puzzleId: "p1", puzzle: buildPuzzle() };
    const { result } = renderHook(() => useGuessState(puzzleData));

    act(() => {
      result.current.handleSubmitGuess({ id: 1, title: "Movie 1" });
      result.current.handleSubmitGuess({ id: 999, title: "Not In Puzzle" });
    });

    expect(result.current.totalGuesses).toBe(2);
    expect(result.current.correctCount).toBe(1);
    expect(result.current.incorrectCount).toBe(1);
  });

  test("marks game as won when all puzzle movies are guessed correctly", async () => {
    const puzzleData = { puzzleId: "p1", puzzle: buildPuzzle() };
    const { result } = renderHook(() => useGuessState(puzzleData));

    act(() => {
      puzzleData.puzzle.forEach((movie) => {
        result.current.handleSubmitGuess({ id: movie.id, title: movie.title });
      });
    });

    await waitFor(() => {
      expect(result.current.youWon).toBe(true);
    });
  });

  test("hint usage consumes guesses until max, then blocks additional hints", async () => {
    const puzzleData = { puzzleId: "p1", puzzle: buildPuzzle() };
    const { result } = renderHook(() => useGuessState(puzzleData));

    for (let index = 0; index < result.current.maxGuesses; index += 1) {
      let allowed = false;
      act(() => {
        allowed = result.current.handleHintUse(index + 1, "overview");
      });
      expect(allowed).toBe(true);
    }

    let denied = true;
    act(() => {
      denied = result.current.handleHintUse("next", "overview");
    });

    expect(denied).toBe(false);

    await waitFor(() => {
      expect(result.current.youLost).toBe(true);
    });
  });

  test("loads persisted state and saves updates", async () => {
    loadLocalJson.mockReturnValue({
      id: "p1",
      guesses: [{ id: 1, correct: true }],
      youWon: false,
      youLost: false,
    });

    const puzzleData = { puzzleId: "p1", puzzle: buildPuzzle() };
    const { result } = renderHook(() => useGuessState(puzzleData));

    await waitFor(() => {
      expect(result.current.totalGuesses).toBe(1);
    });

    expect(saveLocalJson).toHaveBeenCalledWith(
      "p1",
      expect.objectContaining({ id: "p1", guesses: expect.any(Array) }),
    );
  });
});
