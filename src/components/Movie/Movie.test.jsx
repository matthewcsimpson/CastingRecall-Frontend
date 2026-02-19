import { fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("..", () => ({
  ActorHeadshot: ({ actor }) => <div>{`Actor-${actor.id}`}</div>,
  MovieDetails: ({ revealDirector }) => (
    <div>{`MovieDetails-revealDirector-${String(revealDirector)}`}</div>
  ),
  Hints: ({ handleHintClick, revealKeys, revealDirector }) => (
    <div>
      <button
        type="button"
        onClick={(evt) =>
          handleHintClick(
            evt,
            revealKeys.DIRECTOR,
            true,
            revealDirector,
            "director",
          )
        }
      >
        Reveal Director Hint
      </button>
      <div>{`Hints-revealDirector-${String(revealDirector)}`}</div>
    </div>
  ),
}));

jest.mock("../../utilities", () => ({
  shortenMultipleCharNames: jest.fn((value) => value),
  removeVoiceFromString: jest.fn((value) => value),
  loadLocalJson: jest.fn(),
  saveLocalJson: jest.fn(),
}));

const { loadLocalJson, saveLocalJson } = require("../../utilities");
const Movie = require("./Movie").default;

const baseMovie = {
  id: 1,
  title: "Movie One",
  cast: [{ id: 10, character: "Lead", name: "Actor A" }],
};

const buildProps = (overrides = {}) => ({
  puzzleId: "p1",
  movie: baseMovie,
  genres: [{ id: 18, name: "Drama" }],
  guesses: [],
  youWon: false,
  youLost: false,
  reallyWantHints: true,
  onHintSpend: jest.fn(() => true),
  ...overrides,
});

describe("Movie", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    loadLocalJson.mockReturnValue(null);
  });

  test("hydrates reveal state from storage and does not persist unchanged state", async () => {
    loadLocalJson.mockReturnValue({
      revealTitle: false,
      revealDirector: true,
      revealSynopsis: false,
      revealCharNames: false,
      revealHints: true,
    });

    render(<Movie {...buildProps()} />);

    await waitFor(() => {
      expect(loadLocalJson).toHaveBeenCalledWith("p1-1-hints");
    });

    expect(screen.getByText("Hints-revealDirector-true")).toBeInTheDocument();
    expect(saveLocalJson).not.toHaveBeenCalled();
  });

  test("spends hint and persists updated reveal state when allowed", async () => {
    const onHintSpend = jest.fn(() => true);
    render(<Movie {...buildProps({ onHintSpend })} />);

    fireEvent.click(
      screen.getByRole("button", { name: /reveal director hint/i }),
    );

    expect(onHintSpend).toHaveBeenCalledWith(1, "director");

    await waitFor(() => {
      expect(saveLocalJson).toHaveBeenCalledWith(
        "p1-1-hints",
        expect.objectContaining({
          revealDirector: true,
        }),
      );
    });

    expect(screen.getByText("Hints-revealDirector-true")).toBeInTheDocument();
  });

  test("does not reveal or persist spendable hint when spend is denied", async () => {
    const onHintSpend = jest.fn(() => false);
    render(<Movie {...buildProps({ onHintSpend })} />);

    fireEvent.click(
      screen.getByRole("button", { name: /reveal director hint/i }),
    );

    expect(onHintSpend).toHaveBeenCalledWith(1, "director");
    expect(screen.getByText("Hints-revealDirector-false")).toBeInTheDocument();

    await waitFor(() => {
      expect(saveLocalJson).not.toHaveBeenCalled();
    });
  });
});
