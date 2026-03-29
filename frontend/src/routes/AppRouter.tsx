import { Route, Routes } from "react-router-dom";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import MySpacePage from "../pages/MySpacePage";
import UploadPage from "../pages/UploadPage";
import DownloadPage from "../pages/DownloadPage";
import UiPreviewPage from "../pages/UiPreviewPage";
import { ProtectedRoute } from "../components/ProtectedRoute";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/download/:token" element={<DownloadPage />} />
      <Route path="/ui-preview" element={<UiPreviewPage />} />
      <Route path="/upload" element={<UploadPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/my-space" element={<MySpacePage />} />
      </Route>
    </Routes>
  );
}
