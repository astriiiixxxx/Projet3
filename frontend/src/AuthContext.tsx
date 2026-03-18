import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authApi } from "./api/authApi";
import { authStorage } from "./authStorage";
import type { LoginRequest, RegisterRequest, User } from "./types/auth";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(authStorage.getToken());
  const [user, setUser] = useState<User | null>(authStorage.getUser());

  const login = async (payload: LoginRequest) => {
    const data = await authApi.login(payload);

    authStorage.setToken(data.token);
    authStorage.setUser(data.user);

    setToken(data.token);
    setUser(data.user);
  };

  const register = async (payload: RegisterRequest) => {
    await authApi.register(payload);
  };

  const logout = () => {
    authStorage.clear();
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
    }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}