// Styles
import "./ListPage.scss";

// Components
import {
  LoadingScreen,
  PuzzleListHeader,
  PuzzleListItem,
  SiteNav,
} from "../../components";

// Hooks
import { usePuzzleList, usePuzzleStatuses } from "../../hooks";

const ListPage = () => {
  const API_REMOTE_URL = import.meta.env.VITE_API_REMOTE_URL;

  const { data: puzzleList, isLoading: isPuzzleListLoading } = usePuzzleList(
    API_REMOTE_URL
  );

  const hasPuzzles = Array.isArray(puzzleList) && puzzleList.length > 0;
  const statusByPuzzleId = usePuzzleStatuses(puzzleList);
  const showLoading = isPuzzleListLoading && !hasPuzzles;

  return (
    <>
      {hasPuzzles ? (
        <SiteNav puzzleId={"list"} puzzleList={puzzleList} />
      ) : showLoading ? (
        <LoadingScreen />
      ) : null}
      {hasPuzzles ? <PuzzleListHeader /> : null}
      <div className="listpage__listcontainer">
        {hasPuzzles ? (
          puzzleList.map(({ puzzleId, keyPeople }) => (
            <PuzzleListItem
              key={puzzleId}
              puzzleId={puzzleId}
              keyPeople={keyPeople}
              status={statusByPuzzleId[puzzleId]}
            />
          ))
        ) : showLoading ? (
          <LoadingScreen />
        ) : null}
      </div>
    </>
  );
};

export default ListPage;
