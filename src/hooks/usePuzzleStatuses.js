import { useMemo } from "react";
import { getStoredGuessState } from "./useGuessState";

const STATUS = {
  SOLVED: "solved",
  FAILED: "failed",
  IN_PROGRESS: "in_progress",
  NOT_ATTEMPTED: "not_attempted",
};

/**
 * Builds a mapping of puzzleIds to simplified status strings derived from saved guess state.
 * @param {Array<{puzzleId: string}>|null} puzzleList Collection of available puzzles.
 * @returns {Record<string, "solved" | "failed" | "not_attempted">} Object keyed by puzzleId containing status identifiers for the UI.
 */
const usePuzzleStatuses = (puzzleList) => {
  return useMemo(() => {
    if (!Array.isArray(puzzleList) || puzzleList.length === 0) {
      return {};
    }

    return puzzleList.reduce((acc, { puzzleId }) => {
      const stored = getStoredGuessState(puzzleId);

      if (!stored || stored.__err) {
        acc[puzzleId] = STATUS.NOT_ATTEMPTED;
        return acc;
      }

      if (stored.youWon) {
        acc[puzzleId] = STATUS.SOLVED;
      } else if (stored.youLost) {
        acc[puzzleId] = STATUS.FAILED;
      } else if (Array.isArray(stored.guesses) && stored.guesses.length > 0) {
        acc[puzzleId] = STATUS.IN_PROGRESS;
      } else {
        acc[puzzleId] = STATUS.NOT_ATTEMPTED;
      }

      return acc;
    }, {});
  }, [puzzleList]);
};

export default usePuzzleStatuses;
