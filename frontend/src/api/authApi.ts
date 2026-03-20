import { apiClient } from "./axios";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from "../types/auth";

export const authApi = {
  async register(payload: RegisterRequest) {
    const response = await apiClient.post("/auth/register", payload);
    return response.data;
  },

  async login(payload: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post("/auth/login", payload);
    return response.data;
  },
};