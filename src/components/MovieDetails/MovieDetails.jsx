// Libraries
import { useMemo } from "react";

// Components
import { GenreTags } from "..";

// Assets
import questionmarkimg from "../../assets/question.jpg";

import {
  formatDate,
  obscureString,
  shortenString,
  tmdbImageUrl,
  YEAR_ONLY_DATE_OPTIONS,
} from "../../utilities";

import "./MovieDetails.scss";

const MovieDetails = ({
  movie,
  genres,
  revealAll,
  revealTitle,
  revealDirector,
  revealSynopsis,
}) => {
  const posterSrc = useMemo(() => {
    if (!revealAll) {
      return questionmarkimg;
    }

    return tmdbImageUrl(movie?.poster_path, { fallback: questionmarkimg });
  }, [movie?.poster_path, revealAll]);

  const posterAlt = revealAll ? movie?.original_title ?? "" : "hidden!";

  const formattedReleaseYear = useMemo(() => {
    if (!movie?.release_date) {
      return "";
    }

    return formatDate(movie.release_date, YEAR_ONLY_DATE_OPTIONS);
  }, [movie?.release_date]);

  const shortenedSynopsis = useMemo(() => {
    if (!movie?.overview) {
      return "";
    }

    return shortenString(movie.overview);
  }, [movie?.overview]);

  const obscuredSynopsis = useMemo(() => {
    if (!movie?.overview) {
      return "";
    }

    return shortenString(obscureString(movie.overview));
  }, [movie?.overview]);

  const directors = useMemo(() => {
    if (!Array.isArray(movie?.directors)) {
      return [];
    }

    return movie.directors.map((director) => ({
      ...director,
      obscuredName: obscureString(director.name),
    }));
  }, [movie?.directors]);

  const revealTitleVisible = revealAll || revealTitle;
  const revealDirectorVisible = revealAll || revealDirector;
  const revealSynopsisVisible = revealAll || revealSynopsis;

  return (
    <div className="movie__details">
      <h2 className="movie__heading">Movie Details:</h2>
      <div className="movie__details--inner">
        <div className="movie__posterbox">
          <img alt={posterAlt} className="movie__poster" src={posterSrc} />
        </div>
        <div className="movie__detailsbox">
          <div className="movie__detailsbox--title">
            <p className="movie__text movie__text--title">Title: </p>
            <p className="movie__text movie__text--item">
              {revealTitleVisible
                ? movie?.title ?? ""
                : obscureString(movie?.title ?? "")}
            </p>
          </div>
          <div className="movie__detailsbox--director">
            <p className="movie__text movie__text--title">Director: </p>
            <p className="movie__text movie__text--item movie__text">
              {directors.map((director) => (
                <span key={director.id} className="movie__text--directors">
                  {revealDirectorVisible
                    ? director.name
                    : director.obscuredName}
                </span>
              ))}
            </p>
          </div>
          <div className="movie__detailsbox--year">
            <p className="movie__text movie__text--title">Year: </p>
            <p className="movie__text movie__text--item">
              {formattedReleaseYear}
            </p>
          </div>
          <div className="movie__detailsbox--synopsis">
            <p className="movie__text movie__text--title">Synopsis: </p>
            <p className="movie__text movie__text--item">
              {revealSynopsisVisible ? shortenedSynopsis : obscuredSynopsis}
            </p>
          </div>
          <div className="movie__detailsbox--genres">
            <p className="movie__text movie__text--title">Genres: </p>
            <GenreTags genreIds={movie?.genre_ids ?? []} genres={genres} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
