import { render, screen } from "@testing-library/react";
import GamePage from "./GamePage";
import {
  useGenres,
  usePuzzleData,
  usePuzzleList,
  useGuessState,
} from "../../hooks";

jest.mock(
  "axios",
  () => ({
    get: jest.fn(),
    isCancel: jest.fn(() => false),
  }),
  { virtual: true },
);

jest.mock(
  "react-router-dom",
  () => ({
    useParams: jest.fn(),
    NavLink: ({ to, children, className }) => (
      <a href={to} className={className}>
        {children}
      </a>
    ),
  }),
  { virtual: true },
);

const { useParams } = require("react-router-dom");

jest.mock("../../hooks", () => ({
  useGenres: jest.fn(),
  usePuzzleData: jest.fn(),
  usePuzzleList: jest.fn(),
  useGuessState: jest.fn(),
}));

const renderGamePage = () => render(<GamePage />);

describe("GamePage integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useParams.mockReturnValue({ puzzleId: "123" });
  });

  test("renders loading state while puzzle data is pending", () => {
    useGenres.mockReturnValue(null);
    usePuzzleData.mockReturnValue({ data: null, isLoading: true });
    usePuzzleList.mockReturnValue({ data: null, isLoading: true });
    useGuessState.mockReturnValue({
      guesses: [],
      youWon: false,
      youLost: false,
      totalGuesses: 0,
      maxGuesses: 10,
      handleSubmitGuess: jest.fn(),
      handleHintUse: jest.fn(),
    });

    renderGamePage();

    expect(screen.getAllByAltText("loading").length).toBeGreaterThan(0);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  test("renders win-state game UI from hook data", () => {
    const puzzleData = {
      puzzleId: "123",
      keyPeople: ["Tom Hanks", "Meg Ryan"],
      puzzle: [
        {
          id: 1,
          title: "Movie 1",
          original_title: "Movie 1",
          release_date: "1998-01-01",
          overview: "A sample overview for movie 1",
          poster_path: null,
          genre_ids: [18],
          directors: [{ id: 101, name: "Director 1" }],
          cast: [
            {
              id: 1001,
              name: "Actor One",
              character: "Lead",
              profile_path: null,
            },
          ],
        },
        {
          id: 2,
          title: "Movie 2",
          original_title: "Movie 2",
          release_date: "2001-01-01",
          overview: "A sample overview for movie 2",
          poster_path: null,
          genre_ids: [18],
          directors: [{ id: 102, name: "Director 2" }],
          cast: [
            {
              id: 1002,
              name: "Actor Two",
              character: "Support",
              profile_path: null,
            },
          ],
        },
      ],
    };

    useGenres.mockReturnValue([{ id: 18, name: "Drama" }]);
    usePuzzleData.mockReturnValue({ data: puzzleData, isLoading: false });
    usePuzzleList.mockReturnValue({
      data: [{ puzzleId: "123" }, { puzzleId: "122" }],
      isLoading: false,
    });
    useGuessState.mockReturnValue({
      guesses: [{ id: 1, original_title: "Movie 1", correct: true }],
      youWon: true,
      youLost: false,
      totalGuesses: 1,
      maxGuesses: 10,
      handleSubmitGuess: jest.fn(),
      handleHintUse: jest.fn(() => true),
    });

    renderGamePage();

    expect(screen.getByText("Congrats! You won!")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("You finished this game!"),
    ).toBeInTheDocument();
    expect(screen.getByText("✅ Movie 1")).toBeInTheDocument();
    expect(screen.getByText("Puzzle List")).toBeInTheDocument();
    expect(screen.getAllByText("Starring:")).toHaveLength(2);
  });
});
