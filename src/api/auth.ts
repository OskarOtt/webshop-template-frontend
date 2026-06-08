import { apiClient } from "./client";
import type { LoginRequest, RefreshTokenRequest, RegisterRequest, TokenResponse, UserDto } from "../generated/models";

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

export async function refreshToken(body: RefreshTokenRequest): Promise<TokenResponse | undefined> {
  const { data, error } = await apiClient.POST("/auth/refresh", { body });
  if (error) throw error;
  return data;
}

export async function logout(body: RefreshTokenRequest): Promise<void> {
  await apiClient.POST("/auth/logout", { body });
}

export async function getMe(): Promise<UserDto | undefined> {
  const { data, error } = await apiClient.GET("/auth/me", {});
  if (error) throw error;
  return data;
}

