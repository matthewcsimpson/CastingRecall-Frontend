// Styles
import "./GamePage.scss";

// Data
import API from "../../data/api_info.json";

// Components
import SiteNav from "../../components/SiteNav/SiteNav";
import GuessForm from "../../components/GuessForm/GuessForm";
import Movie from "../../components/Movie/Movie";
import LoadingScreen from "../../components/LoadingScreen/LoadingScreen";
import YouWon from "../../components/YouWon/YouWon";
import YouLost from "../../components/YouLost/YouLost";

// Libraries
import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function GamePage() {
  const { puzzleId } = useParams();
  const [puzzleData, setPuzzleData] = useState(null);
  const [genreData, setGenreData] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [correctGuesses, setCorrectGuesses] = useState([]);
  const [youWon, setYouWon] = useState(false);
  const [youLost, setYouLost] = useState(false);

  /**
   * Handle incoming guesses and write them to local storage.
   * @param {*} guesses
   */
  const handleGuesses = (guesses) => {
    setGuesses(guesses);
    const pId = puzzleData.puzzleId;
    const puzzle = {
      id: pId,
      guesses: guesses,
      won: youWon,
      lost: youLost,
    };
    localStorage.setItem(pId, JSON.stringify(puzzle));
  };

  const handleSetCorrectGuesses = (m) => {
    if (!correctGuesses.find((c) => (c.id === m.id ? true : false))) {
      
      setCorrectGuesses([...correctGuesses, m]);
    }
  };

  /**
   * Function to retrieve genre information from TMDB
   */
  const getGenres = async () => {
    await axios
      .get(`${API.api_genre_details}?api_key=${API.api_key}&language=en-US`)
      .then((res) => setGenreData(res.data.genres))
      .catch((err) => console.error(err));
  };

  /**
   * Function to retrieve the the most recently generated puzzle.
   */
  const getLatestPuzzle = async () => {
    await axios
      .get(`${API.api_local_url}/puzzle/`)
      .then((res) => {
        setPuzzleData(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  /**
   * get a specific puzzle from the server
   * @param {*} id
   */
  const getSpecificPuzzle = async (id) => {
    await axios
      .get(`${API.api_local_url}/puzzle/${id}`)
      .then((res) => setPuzzleData(res.data))
      .catch((err) => console.error(err));
  };

  /**
   * Retrieve guess data stored in localStorage, if any
   * @param {object} puzzleData
   */
  const getLocalGuesses = async (puzzleData) => {
    let pId = puzzleData.puzzleId;
    const localGuesses = JSON.parse(localStorage.getItem(pId));
    if (localGuesses && puzzleData) {
      if (puzzleData.puzzleId === localGuesses.id) {
        setGuesses(localGuesses.guesses);
      } else {
        setGuesses([]);
      }
    }
    if (guesses.length > 0) {
      console.info(guesses[0]);
    }
  };

  /**
   * useEffect to load the list of puzzles & genre details from TMDB.
   */
  useEffect(() => {
    getGenres();
    if (puzzleId) {
      getSpecificPuzzle(puzzleId);
    } else {
      getLatestPuzzle();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * useEffect to load guesses from localStorage
   */
  useEffect(() => {
    getLocalGuesses(puzzleData);
  }, [puzzleData]);

  /**
   * Load the puzzle details.
   * If there is a puzzle id, load that puzzle.
   * If there is no puzzle id, load the latest puzzle.
   */
  useEffect(() => {
    if (puzzleId) {
      getSpecificPuzzle(puzzleId);
    } else {
      getLatestPuzzle();
    }

    getLocalGuesses(puzzleData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puzzleId]);

  useEffect(() => {
    console.log(`correct: ${correctGuesses.length}`);
    if (correctGuesses.length > 5) {
      setYouWon(true);
    }
  }, [correctGuesses]);

  useEffect(() => {
    if (guesses.length > 9) {
      setYouLost(true);
    }
  }, [guesses]);

  return (
    <>
      <SiteNav />
      {/* puzzleList={puzzleList} */}
      {puzzleData ? (
        <GuessForm
          guesses={guesses}
          setGuesses={handleGuesses}
          correctGuesses={correctGuesses}
        />
      ) : null}
      {youWon && <YouWon guesses={guesses} />}
      {youLost && <YouLost guesses={guesses} />}

      <div className="movie">
        {puzzleData && genreData ? (
          puzzleData.puzzle.map((movie) => (
            <Movie
              key={movie.id}
              movie={movie}
              genres={genreData}
              guesses={guesses}
              correctGuesses={correctGuesses}
              handleSetCorrectGuesses={handleSetCorrectGuesses}
            />
          ))
        ) : (
          <LoadingScreen />
        )}
      </div>
    </>
  );
}

export default GamePage;
