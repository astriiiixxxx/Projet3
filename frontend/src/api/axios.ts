import axios from "axios";
import { authStorage } from "../authStorage";

export const apiClient = axios.create({
  baseURL: "http://localhost:8000/api",
});

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