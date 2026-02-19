import { renderHook, waitFor } from "@testing-library/react";
import usePuzzleList from "./usePuzzleList";
import { API_ENDPOINTS } from "../constants/config";

jest.mock("axios", () => ({
  get: jest.fn(),
  isCancel: jest.fn(),
}));

const axios = require("axios");

describe("usePuzzleList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axios.isCancel.mockReturnValue(false);
  });

  test("does not fetch when apiUrl is missing", () => {
    const { result } = renderHook(() => usePuzzleList(""));

    expect(axios.get).not.toHaveBeenCalled();
    expect(result.current).toEqual({ data: null, isLoading: true });
  });

  test("fetches and normalizes puzzles array", async () => {
    const puzzles = [{ puzzleId: "1" }, { puzzleId: "2" }];
    axios.get.mockResolvedValue({ data: { puzzles } });

    const apiUrl = "https://api.example.com";
    const { result } = renderHook(() => usePuzzleList(apiUrl));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(puzzles);
    expect(axios.get).toHaveBeenCalledWith(
      `${apiUrl}${API_ENDPOINTS.puzzleList}`,
      expect.any(Object),
    );
  });

  test("handles request failure and stops loading", async () => {
    const error = new Error("network error");
    axios.get.mockRejectedValue(error);
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const { result } = renderHook(() =>
      usePuzzleList("https://api.example.com"),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(errorSpy).toHaveBeenCalledWith(error);
    expect(result.current.data).toBeNull();
  });
});
