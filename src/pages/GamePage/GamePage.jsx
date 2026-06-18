// Components
import {
  Counter,
  GameOutcome,
  GuessForm,
  LoadingScreen,
  Movie,
  SiteNav,
} from "../../components/";

// Libraries
import { useParams } from "react-router-dom";

// Hooks
import {
  useGenres,
  usePuzzleData,
  usePuzzleList,
  useGuessState,
} from "../../hooks";

const GamePage = () => {
  // Data
  const REACT_APP_TMDB_TOKEN = import.meta.env.VITE_TMDB_TOKEN;
  const REACT_APP_TMDB_GENRE_DETAILS = import.meta.env.VITE_TMDB_GENRE_DETAILS;
  const REACT_APP_API_REMOTE_URL = import.meta.env.VITE_API_REMOTE_URL;

  let { puzzleId } = useParams();

  const genreData = useGenres(
    REACT_APP_TMDB_GENRE_DETAILS,
    REACT_APP_TMDB_TOKEN
  );
  const { data: puzzleData, isLoading: isPuzzleLoading } = usePuzzleData(
    REACT_APP_API_REMOTE_URL,
    puzzleId
  );
  const { data: puzzleList, isLoading: isPuzzleListLoading } = usePuzzleList(
    REACT_APP_API_REMOTE_URL
  );
  const {
    guesses,
    youWon,
    youLost,
    totalGuesses,
    maxGuesses,
    handleSubmitGuess,
    handleHintUse,
  } = useGuessState(puzzleData);

  const outcomeStatus = youWon ? "won" : youLost ? "lost" : null;
  const hasPuzzleList = Array.isArray(puzzleList) && puzzleList.length > 0;

  return (
    <>
      {hasPuzzleList ? (
        <SiteNav puzzleId={puzzleId} puzzleList={puzzleList} />
      ) : isPuzzleListLoading ? (
        <LoadingScreen />
      ) : null}
      <GameOutcome
        guesses={guesses}
        status={outcomeStatus}
        featuredNames={puzzleData?.keyPeople}
      />
      {puzzleData ? (
        <>
          <GuessForm
            puzzleId={puzzleId}
            puzzleData={puzzleData}
            guessNum={totalGuesses}
            maxGuesses={maxGuesses}
            youWon={youWon}
            youLost={youLost}
            handleSubmitGuess={handleSubmitGuess}
          />
          <Counter guesses={guesses} />
        </>
      ) : null}

      <div className="movie">
        {puzzleData && genreData ? (
          puzzleData.puzzle.map((movie, i) => (
            <Movie
              key={`${i}-${movie.id}`}
              puzzleId={puzzleData.puzzleId}
              movie={movie}
              genres={genreData}
              guesses={guesses}
              youWon={youWon}
              youLost={youLost}
              reallyWantHints={true}
              onHintSpend={handleHintUse}
            />
          ))
        ) : isPuzzleLoading ? (
          <LoadingScreen />
        ) : null}
      </div>
    </>
  );
};

export default GamePage;
