import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GameOutcome from "./GameOutcome";

const buildProps = (overrides = {}) => ({
  guesses: [
    { id: 1, correct: true },
    { id: 2, correct: false },
    { id: "hint-1", type: "hint", correct: null },
  ],
  status: "won",
  featuredNames: ["Tom Hanks", "Meg Ryan"],
  ...overrides,
});

describe("GameOutcome", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("renders nothing when status is missing", () => {
    render(<GameOutcome {...buildProps({ status: null })} />);

    expect(screen.queryByText("Congrats! You won!")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Share Result" }),
    ).not.toBeInTheDocument();
  });

  test("renders win summary and share button", () => {
    render(<GameOutcome {...buildProps()} />);

    expect(screen.getByText("Congrats! You won!")).toBeInTheDocument();
    expect(
      screen.getByText("You used 2 guesses and 1 hint!"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Share Result" }),
    ).toBeInTheDocument();
  });

  test("copies share text successfully and shows copied state", async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const writeText = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(global.navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    render(<GameOutcome {...buildProps()} />);

    await user.click(screen.getByRole("button", { name: "Share Result" }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledTimes(1);
    });

    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining("Casting Recall: Tom, Meg"),
    );
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Copied!" }),
      ).toBeInTheDocument();
    });

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(
      screen.getByRole("button", { name: "Share Result" }),
    ).toBeInTheDocument();
  });

  test("shows copy failed when clipboard is unavailable", async () => {
    const user = userEvent.setup();
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    Object.defineProperty(global.navigator, "clipboard", {
      configurable: true,
      value: undefined,
    });

    render(<GameOutcome {...buildProps()} />);

    await user.click(screen.getByRole("button", { name: "Share Result" }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Copy failed" }),
      ).toBeInTheDocument();
    });

    expect(errorSpy).toHaveBeenCalledTimes(1);
  });
});
