import { fireEvent, render, screen, waitFor } from "@testing-library/react";

vi.mock("..", () => ({
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

vi.mock("../../utilities", () => ({
  shortenMultipleCharNames: vi.fn((value) => value),
  removeVoiceFromString: vi.fn((value) => value),
  loadLocalJson: vi.fn(),
  saveLocalJson: vi.fn(),
}));

const { loadLocalJson, saveLocalJson } = (await import("../../utilities"));
const Movie = (await import("./Movie")).default;

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
  onHintSpend: vi.fn(() => true),
  ...overrides,
});

describe("Movie", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    const onHintSpend = vi.fn(() => true);
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
    const onHintSpend = vi.fn(() => false);
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
