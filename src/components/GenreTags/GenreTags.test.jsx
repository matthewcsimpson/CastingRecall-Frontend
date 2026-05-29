import { render, screen } from "@testing-library/react";
import GenreTags from "./GenreTags";

const genres = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
];

describe("GenreTags", () => {
  test("renders one tag per id, resolving names from the genre list", () => {
    render(<GenreTags genreIds={[28, 12]} genres={genres} />);

    expect(screen.getByText("Action")).toBeInTheDocument();
    expect(screen.getByText("Adventure")).toBeInTheDocument();
  });

  test("falls back to Unknown for an unrecognised id", () => {
    render(<GenreTags genreIds={[999]} genres={genres} />);

    expect(screen.getByText("Unknown")).toBeInTheDocument();
  });

  test("renders no tags when genreIds is not an array", () => {
    render(<GenreTags genreIds={null} genres={genres} />);

    expect(screen.queryByText("Action")).not.toBeInTheDocument();
    expect(screen.queryByText("Adventure")).not.toBeInTheDocument();
  });

  test("renders no tags for an empty id list", () => {
    render(<GenreTags genreIds={[]} genres={genres} />);

    expect(screen.queryByText("Action")).not.toBeInTheDocument();
  });
});
