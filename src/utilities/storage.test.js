import { loadLocalJson, saveLocalJson } from "./storage";

describe("storage utilities", () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.restoreAllMocks();
  });

  test("saveLocalJson stores serialized JSON", () => {
    const payload = { solved: true, guesses: 2 };

    expect(saveLocalJson("state", payload)).toBe(true);
    expect(window.localStorage.getItem("state")).toBe(JSON.stringify(payload));
  });

  test("loadLocalJson returns parsed value", () => {
    window.localStorage.setItem("state", JSON.stringify({ solved: false }));

    expect(loadLocalJson("state", {})).toEqual({ solved: false });
  });

  test("loadLocalJson returns fallback and reports error for invalid JSON", () => {
    window.localStorage.setItem("state", "{bad json");
    const onError = jest.fn();
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const result = loadLocalJson("state", { fallback: true }, { onError });

    expect(result).toEqual({ fallback: true });
    expect(onError).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledTimes(1);
  });

  test("loadLocalJson can stay silent on parse error", () => {
    window.localStorage.setItem("state", "{bad json");
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const result = loadLocalJson("state", null, { silent: true });

    expect(result).toBeNull();
    expect(errorSpy).not.toHaveBeenCalled();
  });
});
