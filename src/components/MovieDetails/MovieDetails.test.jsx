import { render, screen } from "@testing-library/react";
import MovieDetails from "./MovieDetails";

jest.mock("..", () => ({
  GenreTags: ({ genreIds = [], genres = [] }) => (
    <div>{`GenreTags-${genreIds.length}-${genres.length}`}</div>
  ),
}));

const baseMovie = {
  title: "Sleepless in Seattle",
  original_title: "Sleepless in Seattle",
  poster_path: "/poster.jpg",
  release_date: "1993-06-25",
  overview: "A romantic comedy about fate and radio.",
  directors: [{ id: 1, name: "Nora Ephron" }],
  genre_ids: [35, 18],
};

const genres = [
  { id: 35, name: "Comedy" },
  { id: 18, name: "Drama" },
];

const buildProps = (overrides = {}) => ({
  movie: baseMovie,
  genres,
  revealAll: false,
  revealTitle: false,
  revealDirector: false,
  revealSynopsis: false,
  ...overrides,
});

describe("MovieDetails", () => {
  test("hides poster/title/director/synopsis when reveal flags are false", () => {
    render(<MovieDetails {...buildProps()} />);

    expect(screen.getByRole("img", { name: "hidden!" })).toBeInTheDocument();
    expect(screen.queryByText("Sleepless in Seattle")).not.toBeInTheDocument();
    expect(screen.queryByText("Nora Ephron")).not.toBeInTheDocument();
    expect(
      screen.queryByText("A romantic comedy about fate and radio."),
    ).not.toBeInTheDocument();
    expect(screen.getByText("GenreTags-2-2")).toBeInTheDocument();
  });

  test("reveals all details and poster when revealAll is true", () => {
    render(
      <MovieDetails
        {...buildProps({
          revealAll: true,
        })}
      />,
    );

    const poster = screen.getByRole("img", { name: "Sleepless in Seattle" });
    expect(poster).toHaveAttribute(
      "src",
      expect.stringContaining("/poster.jpg"),
    );
    expect(screen.getByText("Sleepless in Seattle")).toBeInTheDocument();
    expect(screen.getByText("Nora Ephron")).toBeInTheDocument();
    expect(
      screen.getByText("A romantic comedy about fate and radio."),
    ).toBeInTheDocument();
    expect(screen.getByText("1993")).toBeInTheDocument();
  });

  test("handles missing optional movie fields safely", () => {
    render(
      <MovieDetails
        {...buildProps({
          movie: {
            title: "Unknown",
            original_title: "Unknown",
            poster_path: null,
            release_date: "",
            overview: "",
            directors: null,
          },
          revealTitle: true,
          revealDirector: true,
          revealSynopsis: true,
        })}
      />,
    );

    expect(screen.getByRole("img", { name: "hidden!" })).toBeInTheDocument();
    expect(screen.getByText("Unknown")).toBeInTheDocument();
    expect(screen.getByText("GenreTags-0-2")).toBeInTheDocument();
  });
});
