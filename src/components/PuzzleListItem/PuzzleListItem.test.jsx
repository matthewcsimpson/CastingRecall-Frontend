import { render, screen } from "@testing-library/react";
import PuzzleListItem from "./PuzzleListItem";

vi.mock(
  "react-router-dom",
  () => ({
    NavLink: ({ to, children }) => <a href={to}>{children}</a>,
  }));

describe("PuzzleListItem", () => {
  test("renders link, first names, and solved progress text", () => {
    render(
      <PuzzleListItem
        puzzleId="123"
        keyPeople={["Tom Hanks", "Meg Ryan"]}
        status="solved"
      />,
    );

    expect(screen.getByRole("link")).toHaveAttribute("href", "/puzzle/123");
    expect(screen.getByText("Tom")).toBeInTheDocument();
    expect(screen.getByText("Meg")).toBeInTheDocument();
    expect(screen.getByText("Solved!")).toBeInTheDocument();
  });

  test("falls back to not attempted text when status is missing", () => {
    render(
      <PuzzleListItem
        puzzleId="123"
        keyPeople={["Tom Hanks"]}
        status={undefined}
      />,
    );

    expect(screen.getByText("Not yet attempted!")).toBeInTheDocument();
  });

  test("falls back to not attempted text when status is unknown", () => {
    render(
      <PuzzleListItem
        puzzleId="123"
        keyPeople={null}
        status="something_else"
      />,
    );

    expect(screen.getByText("Not yet attempted!")).toBeInTheDocument();
    expect(screen.queryByText("Tom")).not.toBeInTheDocument();
  });
});
