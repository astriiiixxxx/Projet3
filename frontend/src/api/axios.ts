import axios from "axios";
import { authStorage } from "../authStorage";

export const apiClient = axios.create({
  baseURL: "http://localhost:8000/api",
});

/** Extrait pour les tests : 401 hors login/register → session effacée et redirection login. */
export function applyUnauthorizedResponseHandling(
  status: number | undefined,
  requestUrl: string
): void {
  const isAuthLoginOrRegister =
    requestUrl.includes("/auth/login") || requestUrl.includes("/auth/register");
  // 401 métier (mot de passe fichier) — pas une session JWT expirée
  const isPublicDownload = requestUrl.includes("/files/download/");

  if (status === 401 && !isAuthLoginOrRegister && !isPublicDownload) {
    authStorage.clear();
    if (!window.location.pathname.startsWith("/login")) {
      window.location.replace("/login");
    }
  }
}

apiClient.interceptors.request.use((config) => {
  const token = authStorage.getToken();
  const url = config.url ?? "";

  const isPublicAuthRoute =
    url.includes("/auth/login") || url.includes("/auth/register");

  if (token && !isPublicAuthRoute) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    applyUnauthorizedResponseHandling(
      error.response?.status,
      error.config?.url ?? ""
    );
    return Promise.reject(error);
  }
);