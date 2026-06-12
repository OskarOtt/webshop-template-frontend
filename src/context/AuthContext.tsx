import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { login as apiLogin, register as apiRegister, logout as apiLogout, getMe } from "../api/auth";
import { TOKEN_KEY, REFRESH_TOKEN_KEY } from "../api/client";
import { mergeGuestCartIntoServer } from "./CartContext";
import type { LoginRequest, RegisterRequest, UserDto } from "../generated/models";

type AuthUser = UserDto;

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  login: (body: LoginRequest) => Promise<void>;
  register: (body: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function saveTokens(token: string, refreshToken?: string) {
  localStorage.setItem(TOKEN_KEY, token);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(loadStoredToken);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (token && !user) {
      getMe().then((me) => setUser(me ?? null)).catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (body: LoginRequest) => {
    const data = await apiLogin(body);
    if (!data?.token) throw new Error("No token received");
    saveTokens(data.token, data.refreshToken);
    // Fetch user and merge guest cart before updating React state so that
    // CartContext's loadServerCart (triggered by setToken) sees the merged cart.
    const me = await getMe();
    await mergeGuestCartIntoServer();
    setToken(data.token);
    setUser(me ?? null);
  }, []);

  const register = useCallback(async (body: RegisterRequest) => {
    const data = await apiRegister(body);
    if (!data?.token) throw new Error("No token received");
    saveTokens(data.token, data.refreshToken);
    const me = await getMe();
    await mergeGuestCartIntoServer();
    setToken(data.token);
    setUser(me ?? null);
  }, []);

  const logout = useCallback(async () => {
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (storedRefreshToken) {
      await apiLogout({ refreshToken: storedRefreshToken }).catch(() => {});
    }
    clearTokens();
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
