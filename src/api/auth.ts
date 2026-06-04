import { apiClient } from "./client";
import type { LoginRequest, RegisterRequest, TokenResponse, UserDto } from "../generated/models";

export async function login(body: LoginRequest): Promise<TokenResponse | undefined> {
  const { data, error } = await apiClient.POST("/auth/login", { body });
  if (error) throw error;
  return data;
}

export async function register(body: RegisterRequest): Promise<TokenResponse | undefined> {
  const { data, error } = await apiClient.POST("/auth/register", { body });
  if (error) throw error;
  return data;
}

export async function getMe(token: string): Promise<UserDto | undefined> {
  const { data, error } = await apiClient.GET("/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (error) throw error;
  return data;
}

