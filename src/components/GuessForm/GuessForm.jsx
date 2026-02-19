// Styles
import "./GuessForm.scss";

// Libraries
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import axios from "axios";

// Components
import { LoadingScreen } from "..";

// Constants
const TMDB_DEBOUNCE_DELAY_MS = 300;
const TMDB_SUGGESTION_LIMIT = 10;
const EXCLUDED_GENRES = [99, 10770];
const REQUIRED_ORIGINAL_LANGUAGE = "en";

const GuessForm = ({
  puzzleId,
  puzzleData,
  guessNum,
  maxGuesses,
  youWon,
  youLost,
  handleSubmitGuess,
}) => {
  // Data
  const TMDB_TOKEN = process.env.REACT_APP_TMDB_TOKEN;
  const SEARCH_URL = process.env.REACT_APP_TMDB_MOVIE_SEARCH_URL;
  const LOWEST_YEAR = process.env.REACT_APP_TMDB_LOWEST_YEAR;
  const IMG_BASE = process.env.REACT_APP_TMDB_IMG_BASE;

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // Memoized values
  const tmdbLowestYear = useMemo(() => {
    const parsedYear = Number.parseInt(LOWEST_YEAR ?? "", 10);
    return Number.isFinite(parsedYear) ? parsedYear : null;
  }, [LOWEST_YEAR]);

  // Trimmed search query
  const trimmedQuery = useMemo(() => searchQuery.trim(), [searchQuery]);

  // Determine if the game is complete
  const gameComplete = useMemo(() => youWon || youLost, [youWon, youLost]);

  // Dynamic class name for the input field
  const inputClassName = useMemo(
    () =>
      gameComplete
        ? "hero__guessinput hero__guessinput--complete"
        : "hero__guessinput",
    [gameComplete],
  );

  // Placeholder text for the input field
  const placeholderText = useMemo(() => {
    if (gameComplete) {
      return "You finished this game!";
    }
    const guessesLeft = Math.max(maxGuesses - guessNum, 0);
    return `Enter a guess.  You have ${guessesLeft} guesses left...`;
  }, [gameComplete, guessNum, maxGuesses]);

  // Cache for search results to avoid repeat requests (keyed by query + filter signature)
  const searchCache = useRef(null);
  if (!searchCache.current) {
    searchCache.current = new Map();
  }

  const cacheKey = useMemo(() => {
    const yearKey = tmdbLowestYear == null ? "none" : String(tmdbLowestYear);
    return `${trimmedQuery}|minYear=${yearKey}|excluded=${EXCLUDED_GENRES.join(
      ",",
    )}|origLang=${REQUIRED_ORIGINAL_LANGUAGE}`;
  }, [trimmedQuery, tmdbLowestYear]);

  /**
   * Update the current search query from text input.
   * @param {React.ChangeEvent<HTMLInputElement>} evt Input change event.
   */
  const handleFieldChange = useCallback((evt) => {
    setSearchQuery(evt.target.value);
  }, []);

  /**
   * Submit a selected suggestion as a guess and reset suggestion UI.
   * @param {React.MouseEvent<HTMLButtonElement>} evt Suggestion click event.
   */
  const handleSuggestionSelect = useCallback(
    (evt) => {
      evt.preventDefault();
      const movieId = Number(evt.currentTarget.dataset.movieId);
      if (!movieId) {
        return;
      }

      const selectedMovie = searchResults.find((movie) => movie.id === movieId);
      if (!selectedMovie) {
        return;
      }

      handleSubmitGuess(selectedMovie);
      setSearchResults([]);
      setSearchQuery("");
    },
    [handleSubmitGuess, searchResults],
  );

  /**
   * Fetch TMDB suggestions, apply puzzle filters, then cache the result.
   * @param {string} query Search query string.
   * @param {AbortController} controller Abort controller for request cancellation.
   */
  const fetchSuggestions = useCallback(
    async (query, controller) => {
      if (!SEARCH_URL) {
        console.error("TMDB search URL is not configured.");
        return;
      }

      try {
        const url = new URL(SEARCH_URL);
        url.searchParams.set("query", query);
        url.searchParams.set("include_adult", "false");
        url.searchParams.set("region", "US");
        url.searchParams.set("language", "en-US");
        url.searchParams.set("page", "1");

        const response = await axios.get(url.toString(), {
          signal: controller?.signal,
          headers: {
            Authorization: `Bearer ${TMDB_TOKEN}`,
            Accept: "application/json",
          },
        });

        const rawResults = Array.isArray(response?.data?.results)
          ? response.data.results
          : [];

        // Strict filter: require valid release_date and genre_ids, exclude by genre and year,
        // and align with BE puzzle rules by enforcing original_language === "en".
        const filteredResults = rawResults.filter((movie) => {
          if (movie?.original_language !== REQUIRED_ORIGINAL_LANGUAGE) {
            return false;
          }

          if (
            typeof movie?.release_date !== "string" ||
            movie.release_date.length < 4
          ) {
            return false;
          }

          if (!Array.isArray(movie.genre_ids) || movie.genre_ids.length === 0) {
            return false;
          }

          if (movie.genre_ids.some((id) => EXCLUDED_GENRES.includes(id))) {
            return false;
          }

          const releaseYear = Number.parseInt(
            movie.release_date.slice(0, 4),
            10,
          );
          if (!Number.isFinite(releaseYear)) {
            return false;
          }

          if (tmdbLowestYear != null && releaseYear < tmdbLowestYear) {
            return false;
          }

          return true;
        });

        const limitedResults = filteredResults.slice(0, TMDB_SUGGESTION_LIMIT);

        searchCache.current.set(cacheKey, limitedResults);
        setSearchResults(limitedResults);
      } catch (err) {
        if (axios.isCancel?.(err) || err?.name === "CanceledError") {
          return;
        }
        if (err instanceof TypeError) {
          console.error("Failed to build TMDB request URL.", err);
          return;
        }
        console.error(err);
      }
    },
    [SEARCH_URL, TMDB_TOKEN, tmdbLowestYear, cacheKey],
  );

  // Fetch suggestions when query/filter state changes.
  useEffect(() => {
    if (!trimmedQuery || trimmedQuery.length < 1) {
      setSearchResults([]);
      return;
    }

    if (!TMDB_TOKEN) {
      console.error("TMDB bearer token is not configured.");
      setSearchResults([]);
      return;
    }

    if (!SEARCH_URL) {
      console.error("TMDB search URL is not configured.");
      setSearchResults([]);
      return;
    }

    if (searchCache.current.has(cacheKey)) {
      setSearchResults(searchCache.current.get(cacheKey));
      return;
    }

    const controller = new AbortController();
    const debounce = setTimeout(() => {
      fetchSuggestions(trimmedQuery, controller);
    }, TMDB_DEBOUNCE_DELAY_MS);

    return () => {
      controller.abort();
      clearTimeout(debounce);
    };
  }, [TMDB_TOKEN, SEARCH_URL, trimmedQuery, cacheKey, fetchSuggestions]);

  // Reset search UI/cache when moving to a different puzzle.
  useEffect(() => {
    setSearchResults([]);
    setSearchQuery("");
    searchCache.current.clear();
  }, [puzzleId]);

  return (
    <div className="hero">
      <div className="hero__wrapper">
        {puzzleData ? (
          <form className="hero__guessform" autoComplete="off">
            <input
              name="search_term"
              className={inputClassName}
              type="text"
              value={searchQuery}
              placeholder={placeholderText}
              onChange={handleFieldChange}
              disabled={gameComplete}
            />
            <div className="hero__suggestionpositioning">
              <ul className="hero__searchsuggestions">
                {searchResults &&
                  searchResults.map((movie) => {
                    const posterUrl = movie.poster_path
                      ? `${IMG_BASE}${movie.poster_path}`
                      : null;

                    return (
                      <li key={movie.id}>
                        <button
                          className="hero__suggestion"
                          type="button"
                          data-movie-id={movie.id}
                          onClick={handleSuggestionSelect}
                        >
                          {posterUrl && (
                            <img
                              src={posterUrl}
                              alt={movie.title}
                              className="hero__suggestionposter"
                            />
                          )}
                          <span>{movie.title}</span>
                        </button>
                      </li>
                    );
                  })}
              </ul>
            </div>
          </form>
        ) : (
          <LoadingScreen />
        )}
      </div>
    </div>
  );
};

export default GuessForm;
