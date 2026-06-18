import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
    isCancel: vi.fn(() => false),
  },
}));

vi.mock("..", () => ({
  LoadingScreen: () => <div>LoadingScreen</div>,
}));

const axios = (await import("axios")).default;
const GuessForm = (await import("./GuessForm")).default;

const buildProps = (overrides = {}) => ({
  puzzleId: "123",
  puzzleData: { puzzleId: "123" },
  guessNum: 2,
  maxGuesses: 10,
  youWon: false,
  youLost: false,
  handleSubmitGuess: vi.fn(),
  ...overrides,
});

describe("GuessForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    vi.stubEnv("VITE_TMDB_TOKEN", "token-123");
    vi.stubEnv("VITE_TMDB_MOVIE_SEARCH_URL", "https://api.example.com/search/movie");
    vi.stubEnv("VITE_TMDB_LOWEST_YEAR", "1980");
    vi.stubEnv("VITE_TMDB_IMG_BASE", "https://image.example.com/");
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("renders loading screen when puzzle data is missing", () => {
    const props = buildProps({ puzzleData: null });

    render(<GuessForm {...props} />);

    expect(screen.getByText("LoadingScreen")).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  test("disables input and shows completion placeholder when game is complete", () => {
    const props = buildProps({ youWon: true });

    render(<GuessForm {...props} />);

    const input = screen.getByRole("textbox");

    expect(input).toBeDisabled();
    expect(input).toHaveAttribute("placeholder", "You finished this game!");
  });

  test("fetches filtered suggestions and submits selected movie", async () => {
    const handleSubmitGuess = vi.fn();
    const props = buildProps({ handleSubmitGuess, guessNum: 0 });

    axios.get.mockResolvedValue({
      data: {
        results: [
          {
            id: 1,
            title: "Valid Movie",
            poster_path: "/valid.jpg",
            original_language: "en",
            release_date: "2000-01-01",
            genre_ids: [18],
          },
          {
            id: 2,
            title: "Excluded Genre",
            poster_path: "/excluded.jpg",
            original_language: "en",
            release_date: "2001-01-01",
            genre_ids: [99],
          },
          {
            id: 3,
            title: "Wrong Language",
            poster_path: "/foreign.jpg",
            original_language: "fr",
            release_date: "2002-01-01",
            genre_ids: [18],
          },
        ],
      },
    });

    render(<GuessForm {...props} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Valid" } });

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByText("Valid Movie")).toBeInTheDocument();
    expect(screen.queryByText("Excluded Genre")).not.toBeInTheDocument();
    expect(screen.queryByText("Wrong Language")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /valid movie/i }));

    expect(handleSubmitGuess).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1, title: "Valid Movie" }),
    );
    expect(input).toHaveValue("");
    expect(screen.queryByText("Valid Movie")).not.toBeInTheDocument();
  });
});
