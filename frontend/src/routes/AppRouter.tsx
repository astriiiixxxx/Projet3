import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import MySpacePage from "../pages/MySpacePage";
import UploadPage from "../pages/UploadPage";
import DownloadPage from "../pages/DownloadPage";
import { ProtectedRoute } from "../components/ProtectedRoute";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/upload" replace />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/download/:token" element={<DownloadPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/my-space" element={<MySpacePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}