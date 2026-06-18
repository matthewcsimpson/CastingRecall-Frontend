import { renderHook, waitFor } from "@testing-library/react";
import usePuzzleList from "./usePuzzleList";
import { API_ENDPOINTS } from "../constants/config";

vi.mock("axios", () => ({ default: {
  get: vi.fn(),
  isCancel: vi.fn(),
} }));

const axios = (await import("axios")).default;

describe("usePuzzleList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axios.isCancel.mockReturnValue(false);
  });

  test("does not fetch and resolves to not-loading when apiUrl is missing", () => {
    const { result } = renderHook(() => usePuzzleList(""));

    expect(axios.get).not.toHaveBeenCalled();
    expect(result.current).toEqual({ data: null, isLoading: false });
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
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

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
