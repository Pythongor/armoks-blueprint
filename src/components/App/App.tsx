import { HashRouter, Navigate, Route, Routes } from "react-router-dom";

import { AboutPage } from "../pages/about/page";
import { ExportPage } from "@components/pages/export/page";
import { GalleryPage } from "../pages/gallery/page";
import { MainEditorLayout } from "@components/MainEditorLayout/MainEditorLayout";
import { MapPage } from "@components/pages/map/page";
import { ModalManager } from "../Modal/ModalManager";
import type { RootState } from "@store/store";
import { StartPage } from "@components/pages/start/page";
import { WorldSettingsPage } from "../pages/world-settings/page";
import { useSelector } from "react-redux";

export function App() {
  const isInitialized = useSelector(
    (state: RootState) => state.world.isInitialized,
  );

  return (
    <>
      <ModalManager />
      <HashRouter>
        <Routes>
          <Route
            path="/"
            element={
              !isInitialized ? <StartPage /> : <Navigate to="/world-settings" />
            }
          />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route
            element={isInitialized ? <MainEditorLayout /> : <Navigate to="/" />}
          >
            <Route path="/world-settings" element={<WorldSettingsPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/export" element={<ExportPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </>
  );
}
