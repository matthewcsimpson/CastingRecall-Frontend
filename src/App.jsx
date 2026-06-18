// styles
import "./styles/style.scss";

// Components
import { SiteFooter, SiteHeader } from "./components";

// Pages
import GamePage from "./pages/GamePage/GamePage";
import ListPage from "./pages/ListPage/ListPage";

// Libraries
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ROUTES } from "./constants/config";

const App = () => {
  return (
    <BrowserRouter>
      <SiteHeader />
      <Routes>
        <Route path={ROUTES.home} element={<GamePage />} />
        <Route path={ROUTES.puzzleId} element={<GamePage />} />
        <Route path={ROUTES.puzzleList} element={<ListPage />} />
        <Route path={ROUTES.fallback} element={<GamePage />} />
      </Routes>
      <SiteFooter />
    </BrowserRouter>
  );
};

export default App;
