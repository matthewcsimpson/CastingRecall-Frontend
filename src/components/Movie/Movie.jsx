// Styles
import "./Movie.scss";

// Components
import { ActorHeadshot, Hints, MovieDetails } from "..";

// Libraries
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";

// Utility Functions
import {
  shortenMultipleCharNames,
  removeVoiceFromString,
  loadLocalJson,
  saveLocalJson,
} from "../../utilities";

const RevealKeys = Object.freeze({
  TITLE: "title",
  DIRECTOR: "director",
  SYNOPSIS: "synopsis",
  CHAR_NAMES: "charNames",
  HINTS: "hints",
});

const RevealActionTypes = Object.freeze({
  SET: "SET",
  RESET: "RESET",
});

const ValidRevealKeys = new Set(Object.values(RevealKeys));

const createInitialRevealState = () => ({
  [RevealKeys.TITLE]: false,
  [RevealKeys.DIRECTOR]: false,
  [RevealKeys.SYNOPSIS]: false,
  [RevealKeys.CHAR_NAMES]: false,
  [RevealKeys.HINTS]: false,
});

/**
 * Manage reveal flag updates for movie details and hints.
 * @param {Record<string, boolean>} state Current reveal state.
 * @param {{type: string, payload?: Record<string, boolean>}} action Reducer action.
 * @returns {Record<string, boolean>} Updated reveal state.
 */
const revealReducer = (state, action) => {
  switch (action.type) {
    case RevealActionTypes.SET:
      return { ...state, ...action.payload };
    case RevealActionTypes.RESET:
      return { ...createInitialRevealState(), ...action.payload };
    default:
      return state;
  }
};

const Movie = ({
  puzzleId,
  movie,
  genres,
  guesses,
  youWon,
  youLost,
  reallyWantHints,
  onHintSpend,
}) => {
  const [revealState, dispatchReveal] = useReducer(
    revealReducer,
    undefined,
    createInitialRevealState,
  );

  const {
    [RevealKeys.TITLE]: revealTitle,
    [RevealKeys.DIRECTOR]: revealDirector,
    [RevealKeys.SYNOPSIS]: revealSynopsis,
    [RevealKeys.CHAR_NAMES]: revealCharNames,
    [RevealKeys.HINTS]: revealHints,
  } = revealState;

  /**
   * Build the localStorage key for this movie's hint reveal state.
   * Returns null when puzzleId is missing to disable persistence.
   */
  const hintsStorageKey = useMemo(() => {
    if (!puzzleId) {
      return null;
    }
    return `${puzzleId}-${movie.id}-hints`;
  }, [movie.id, puzzleId]);

  /**
   * True when this movie appears in guesses as a correct answer.
   */
  const movieGuessed = useMemo(() => {
    if (!Array.isArray(guesses)) {
      return false;
    }

    return guesses.some(
      (guess) => guess.id === movie.id && guess.correct === true,
    );
  }, [guesses, movie.id]);

  /**
   * True when full movie details should be shown (guessed, won, or lost).
   */
  const revealAll = useMemo(
    () => movieGuessed || youWon || youLost,
    [movieGuessed, youWon, youLost],
  );

  /**
   * Normalize cast rows and derive a sanitized character label for display.
   */
  const processedCast = useMemo(() => {
    if (!Array.isArray(movie?.cast)) {
      return [];
    }

    return movie.cast.map((actor) => {
      const characterName =
        typeof actor?.character === "string" ? actor.character : "";
      const sanitizedCharacter = characterName
        ? removeVoiceFromString(shortenMultipleCharNames(characterName))
        : "";

      return {
        ...actor,
        sanitizedCharacter,
      };
    });
  }, [movie?.cast]);

  const revealCharNamesVisible = revealAll || revealCharNames;

  const hydratedHintsRef = useRef(null);
  const [hintsHydrated, setHintsHydrated] = useState(false);

  /**
   * Handle revealing the hints
   * @param {React.SyntheticEvent} evt React synthetic event
   * @param {string} stateKey Reveal flag key to update; expected to match one of RevealKeys
   * @param {boolean} actualHint Flag to indicate if this is a spendable hint
   * @param {boolean} currentState Current reveal value for the hint
   * @param {string|null} [hintKey] Identifier used for hint bookkeeping
   */
  const handleHintClick = useCallback(
    (evt, stateKey, actualHint, currentState, hintKey = null) => {
      evt.preventDefault();

      if (!ValidRevealKeys.has(stateKey)) {
        return;
      }

      if (actualHint) {
        if (currentState) {
          return;
        }

        if (typeof onHintSpend === "function") {
          const spent = onHintSpend(movie.id, hintKey);

          if (!spent) {
            return;
          }
        }
      }

      dispatchReveal({
        type: RevealActionTypes.SET,
        payload: { [stateKey]: true },
      });
    },
    [movie.id, onHintSpend],
  );

  // ------------------------------------------------------------------------useEffects

  /**
   * Reveal title/director/synopsis/character names whenever full reveal is active.
   */
  useEffect(() => {
    if (revealAll) {
      dispatchReveal({
        type: RevealActionTypes.SET,
        payload: {
          [RevealKeys.DIRECTOR]: true,
          [RevealKeys.SYNOPSIS]: true,
          [RevealKeys.CHAR_NAMES]: true,
          [RevealKeys.TITLE]: true,
        },
      });
    }
  }, [revealAll]);

  /**
   * Hydrate reveal flags from localStorage whenever the storage key changes.
   */
  useEffect(() => {
    if (!hintsStorageKey) {
      hydratedHintsRef.current = null;
      setHintsHydrated(false);
      return;
    }

    setHintsHydrated(false);

    const stored = loadLocalJson(hintsStorageKey);
    const nextStoredPayload = {
      revealTitle: Boolean(stored?.revealTitle),
      revealDirector: Boolean(stored?.revealDirector),
      revealSynopsis: Boolean(stored?.revealSynopsis),
      revealCharNames: Boolean(stored?.revealCharNames),
      revealHints: Boolean(stored?.revealHints),
    };

    dispatchReveal({
      type: RevealActionTypes.RESET,
      payload: {
        [RevealKeys.TITLE]: nextStoredPayload.revealTitle,
        [RevealKeys.DIRECTOR]: nextStoredPayload.revealDirector,
        [RevealKeys.SYNOPSIS]: nextStoredPayload.revealSynopsis,
        [RevealKeys.CHAR_NAMES]: nextStoredPayload.revealCharNames,
        [RevealKeys.HINTS]: nextStoredPayload.revealHints,
      },
    });

    hydratedHintsRef.current = nextStoredPayload;
    setHintsHydrated(true);
  }, [hintsStorageKey]);

  /**
   * Persist reveal flags after hydration, skipping writes when values are unchanged.
   */
  useEffect(() => {
    if (!hintsStorageKey || !hintsHydrated) {
      return;
    }

    const payload = {
      revealTitle: revealTitle,
      revealDirector: revealDirector,
      revealSynopsis: revealSynopsis,
      revealCharNames: revealCharNames,
      revealHints: revealHints,
    };

    if (
      hydratedHintsRef.current &&
      Object.keys(payload).every(
        (key) => hydratedHintsRef.current[key] === payload[key],
      )
    ) {
      return;
    }

    hydratedHintsRef.current = payload;

    saveLocalJson(hintsStorageKey, payload);
  }, [
    hintsStorageKey,
    hintsHydrated,
    revealDirector,
    revealSynopsis,
    revealCharNames,
    revealTitle,
    revealHints,
  ]);

  return (
    <>
      <div
        className={
          movieGuessed
            ? "movie__wrapper movie__wrapper--guessed"
            : "movie__wrapper"
        }
      >
        <div className="movie__castpics">
          <h2 className="movie__heading">Starring:</h2>
          <div className="movie__castpics--inner">
            {processedCast.map((actor) => (
              <ActorHeadshot
                key={actor.id}
                actor={actor}
                revealCharNamesVisible={revealCharNamesVisible}
              />
            ))}
          </div>
        </div>
        <MovieDetails
          movie={movie}
          genres={genres}
          revealAll={revealAll}
          revealTitle={revealTitle}
          revealDirector={revealDirector}
          revealSynopsis={revealSynopsis}
        />
        {reallyWantHints && (
          <Hints
            handleHintClick={handleHintClick}
            revealKeys={RevealKeys}
            revealHints={revealHints}
            revealDirector={revealDirector}
            revealSynopsis={revealSynopsis}
            revealCharNames={revealCharNames}
            movieGuessed={movieGuessed}
            youWon={youWon}
            youLost={youLost}
          />
        )}
      </div>
    </>
  );
};

export default Movie;
