import { renderHook, waitFor } from "@testing-library/react";
import useFetch from "./useFetch";

jest.mock("axios", () => ({
  get: jest.fn(),
  isCancel: jest.fn(),
}));

const axios = require("axios");

const flushMicrotasks = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("useFetch", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axios.isCancel.mockReturnValue(false);
  });

  test("does not fetch and resolves to not-loading when url is falsy", () => {
    const { result } = renderHook(() => useFetch(""));

    expect(axios.get).not.toHaveBeenCalled();
    expect(result.current).toEqual({ data: null, isLoading: false });
  });

  test("returns response.data and clears loading on success", async () => {
    const payload = { puzzleId: "latest" };
    axios.get.mockResolvedValue({ data: payload });

    const { result } = renderHook(() => useFetch("https://api.example.com/x"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(payload);
  });

  test("applies a select function to reshape the response", async () => {
    axios.get.mockResolvedValue({ data: { items: [1, 2, 3] } });

    const { result } = renderHook(() =>
      useFetch("https://api.example.com/x", {
        select: (response) => response.data.items,
      }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual([1, 2, 3]);
  });

  test("forwards headers and an abort signal to axios.get", async () => {
    axios.get.mockResolvedValue({ data: {} });
    const headers = { Authorization: "Bearer token-123" };

    const { result } = renderHook(() =>
      useFetch("https://api.example.com/x", { headers }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(axios.get).toHaveBeenCalledWith(
      "https://api.example.com/x",
      expect.objectContaining({
        headers,
        signal: expect.any(AbortSignal),
      }),
    );
  });

  test("swallows cancellation without logging or clearing loading", async () => {
    axios.isCancel.mockReturnValue(true);
    axios.get.mockRejectedValue({ name: "CanceledError" });
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const { result } = renderHook(() => useFetch("https://api.example.com/x"));

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(1);
    });
    await flushMicrotasks();

    expect(errorSpy).not.toHaveBeenCalled();
    expect(result.current).toEqual({ data: null, isLoading: true });

    errorSpy.mockRestore();
  });

  test("logs a real error once and stops loading with data untouched", async () => {
    const error = new Error("network down");
    axios.get.mockRejectedValue(error);
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const { result } = renderHook(() => useFetch("https://api.example.com/x"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(errorSpy).toHaveBeenCalledWith(error);
    expect(result.current.data).toBeNull();

    errorSpy.mockRestore();
  });

  test("aborts the in-flight request on unmount", async () => {
    axios.get.mockResolvedValue({ data: {} });
    const abortSpy = jest.spyOn(AbortController.prototype, "abort");

    const { unmount } = renderHook(() =>
      useFetch("https://api.example.com/x"),
    );

    unmount();

    expect(abortSpy).toHaveBeenCalled();

    abortSpy.mockRestore();
  });
});
