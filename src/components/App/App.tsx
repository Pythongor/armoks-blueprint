import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { MainEditorLayout } from "../MainEditorLayout/MainEditorLayout";
import { MapPage } from "../pages/mapPage/page";
import type { RootState } from "@store/index";
import { StartModal } from "@components/pages/startPage/StartModal/StartModal";
import { useSelector } from "react-redux";

export function App() {
  const isInitialized = useSelector(
    (state: RootState) => state.world.isInitialized,
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={!isInitialized ? <StartModal /> : <Navigate to="/map" />}
        />
        <Route
          element={isInitialized ? <MainEditorLayout /> : <Navigate to="/" />}
        >
          <Route path="/map" element={<MapPage />} />
          <Route path="/world-settings" element={<div>Settings Content</div>} />
          <Route path="/export" element={<div>Export Content</div>} />
          <Route path="/new" element={<div>New Project Content</div>} />
          <Route path="/about" element={<div>About Content</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
