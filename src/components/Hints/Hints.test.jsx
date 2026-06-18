import { fireEvent, render, screen } from "@testing-library/react";
import Hints from "./Hints";

const revealKeys = {
  HINTS: "hints",
  DIRECTOR: "director",
  SYNOPSIS: "synopsis",
  CHAR_NAMES: "charNames",
};

const buildProps = (overrides = {}) => ({
  handleHintClick: vi.fn(),
  revealKeys,
  revealHints: false,
  revealDirector: false,
  revealSynopsis: false,
  revealCharNames: false,
  movieGuessed: false,
  youWon: false,
  youLost: false,
  ...overrides,
});

describe("Hints", () => {
  test("shows prompt when hints are hidden and requests reveal on click", () => {
    const handleHintClick = vi.fn();
    render(<Hints {...buildProps({ handleHintClick })} />);

    fireEvent.click(screen.getByText("pssst....need a hint?"));

    expect(handleHintClick).toHaveBeenCalledWith(
      expect.any(Object),
      revealKeys.HINTS,
      false,
      false,
    );
    expect(
      screen.queryByRole("button", { name: "Director" }),
    ).not.toBeInTheDocument();
  });

  test("shows hint buttons and passes expected payload when clicked", () => {
    const handleHintClick = vi.fn();
    render(
      <Hints
        {...buildProps({
          handleHintClick,
          revealHints: true,
        })}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Director" }));
    fireEvent.click(screen.getByRole("button", { name: "Synopsis" }));
    fireEvent.click(screen.getByRole("button", { name: "Names" }));

    expect(handleHintClick).toHaveBeenCalledWith(
      expect.any(Object),
      revealKeys.DIRECTOR,
      true,
      false,
      "director",
    );
    expect(handleHintClick).toHaveBeenCalledWith(
      expect.any(Object),
      revealKeys.SYNOPSIS,
      true,
      false,
      "synopsis",
    );
    expect(handleHintClick).toHaveBeenCalledWith(
      expect.any(Object),
      revealKeys.CHAR_NAMES,
      true,
      false,
      "names",
    );
  });

  test("disables spendable hint buttons when game is complete", () => {
    render(<Hints {...buildProps({ revealHints: true, youWon: true })} />);

    expect(screen.getByRole("button", { name: "Director" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Synopsis" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Names" })).toBeDisabled();
  });
});
