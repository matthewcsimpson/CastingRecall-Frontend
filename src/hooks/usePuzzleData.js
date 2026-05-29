import { API_ENDPOINTS } from "constants/config";
import useFetch from "./useFetch";

/**
 * Retrieves puzzle payloads from the Casting Recall API and exposes them to consumers.
 * Automatically refreshes whenever the target puzzleId changes.
 * @param {string} apiUrl Base API URL for puzzle requests.
 * @param {string|undefined} puzzleId Specific puzzle identifier or undefined for the latest puzzle.
 * @returns {{data: object|null, isLoading: boolean}} Puzzle payload and loading flag.
 */
const usePuzzleData = (apiUrl, puzzleId) => {
  const activePuzzleId = puzzleId || "latest";
  const url = apiUrl
    ? `${apiUrl}${API_ENDPOINTS.puzzleId.replace(":puzzleId", activePuzzleId)}`
    : null;

  return useFetch(url);
};

export default usePuzzleData;
