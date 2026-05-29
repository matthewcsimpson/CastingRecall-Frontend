import { render, screen } from "@testing-library/react";
import PuzzleListHeader from "./PuzzleListHeader";

describe("PuzzleListHeader", () => {
  test("renders the column labels", () => {
    render(<PuzzleListHeader />);

    expect(screen.getByText("Puzzle Name")).toBeInTheDocument();
    expect(screen.getByText("Progress")).toBeInTheDocument();
  });
});
