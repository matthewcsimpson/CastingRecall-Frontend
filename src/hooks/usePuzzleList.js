import { API_ENDPOINTS } from "../constants/config";
import useFetch from "./useFetch";

/**
 * Normalizes the puzzle-list response into a flat array, tolerating either a
 * `{ puzzles: [...] }` envelope, a bare array, or a single object.
 * @param {import("axios").AxiosResponse} response Raw axios response.
 * @returns {Array<object>} Normalized puzzle collection.
 */
const normalizePuzzleList = (response) => {
  const { puzzles } = response?.data ?? {};
  return Array.isArray(puzzles)
    ? puzzles
    : Array.isArray(response?.data)
    ? response.data
    : [response?.data].filter(Boolean);
};

/**
 * Retrieves the full puzzle list from the Casting Recall API.
 * @param {string} apiUrl Base API URL for list requests.
 * @returns {{data: Array<object>|null, isLoading: boolean}} Puzzle collection and loading flag.
 */
const usePuzzleList = (apiUrl) => {
  const url = apiUrl ? `${apiUrl}${API_ENDPOINTS.puzzleList}` : null;

  return useFetch(url, { select: normalizePuzzleList });
};

export default usePuzzleList;
