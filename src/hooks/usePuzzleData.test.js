import { renderHook, waitFor } from "@testing-library/react";
import usePuzzleData from "./usePuzzleData";
import { API_ENDPOINTS } from "../constants/config";

vi.mock("axios", () => ({ default: {
  get: vi.fn(),
  isCancel: vi.fn(),
} }));

const axios = (await import("axios")).default;

describe("usePuzzleData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axios.isCancel.mockReturnValue(false);
  });

  test("does not fetch and resolves to not-loading when apiUrl is missing", () => {
    const { result } = renderHook(() => usePuzzleData("", "123"));

    expect(axios.get).not.toHaveBeenCalled();
    expect(result.current).toEqual({ data: null, isLoading: false });
  });

  test("fetches latest puzzle when puzzleId is omitted", async () => {
    const payload = { puzzleId: "latest", puzzle: [] };
    axios.get.mockResolvedValue({ data: payload });

    const apiUrl = "https://api.example.com";
    const { result } = renderHook(() => usePuzzleData(apiUrl));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(payload);
    expect(axios.get).toHaveBeenCalledWith(
      `${apiUrl}${API_ENDPOINTS.puzzleId.replace(":puzzleId", "latest")}`,
      expect.any(Object),
    );
  });

  test("handles request failure and stops loading", async () => {
    const error = new Error("network error");
    axios.get.mockRejectedValue(error);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { result } = renderHook(() =>
      usePuzzleData("https://api.example.com", "123"),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(errorSpy).toHaveBeenCalledWith(error);
    expect(result.current.data).toBeNull();
  });
});
