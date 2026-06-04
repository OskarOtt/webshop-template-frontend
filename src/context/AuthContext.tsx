import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { login as apiLogin, register as apiRegister, getMe } from "../api/auth";
import type { LoginRequest, RegisterRequest, UserDto } from "../generated/models";

type AuthUser = UserDto;

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  login: (body: LoginRequest) => Promise<void>;
  register: (body: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "auth_token";

function loadStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(loadStoredToken);
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = useCallback(async (body: LoginRequest) => {
    const data = await apiLogin(body);
    if (!data?.token) throw new Error("No token received");
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    const me = await getMe(data.token);
    setUser(me ?? null);
  }, []);

  const register = useCallback(async (body: RegisterRequest) => {
    await apiRegister(body);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
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
