import { renderHook, waitFor } from "@testing-library/react";
import useGenres from "./useGenres";

vi.mock("axios", () => ({ default: {
  get: vi.fn(),
  isCancel: vi.fn(),
} }));

const axios = (await import("axios")).default;

describe("useGenres", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axios.isCancel.mockReturnValue(false);
  });

  test("does not fetch when required inputs are missing", () => {
    renderHook(() => useGenres("", ""));
    expect(axios.get).not.toHaveBeenCalled();
  });

  test("fetches genre data and returns genres array", async () => {
    const genres = [{ id: 28, name: "Action" }];
    axios.get.mockResolvedValue({ data: { genres } });

    const genreUrl = "https://example.com/genre/movie/list";
    const bearerToken = "token-123";

    const { result } = renderHook(() => useGenres(genreUrl, bearerToken));

    await waitFor(() => {
      expect(result.current).toEqual(genres);
    });

    expect(axios.get).toHaveBeenCalledWith(
      `${genreUrl}?language=en-US`,
      expect.objectContaining({
        headers: {
          Authorization: `Bearer ${bearerToken}`,
          Accept: "application/json",
        },
      }),
    );
  });

  test("handles request errors and leaves data as null", async () => {
    const error = new Error("request failed");
    axios.get.mockRejectedValue(error);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { result } = renderHook(() =>
      useGenres("https://example.com/genre/movie/list", "token-123"),
    );

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalledWith(error);
    });

    expect(result.current).toBeNull();
  });
});
