import createClient from "openapi-fetch";
import type { paths } from "../generated/schema.d.ts";
import { API_BASE_URL } from "../env";

export const TOKEN_KEY = "auth_token";
export const REFRESH_TOKEN_KEY = "auth_refresh_token";

export const apiClient = createClient<paths>({
  baseUrl: API_BASE_URL,
});

// Inject stored JWT token into every request
apiClient.use({
  onRequest({ request }) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      request.headers.set("Authorization", `Bearer ${token}`);
    }
    return request;
  },

  async onResponse({ response, request }) {
    if (response.status !== 401) return response;

    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!storedRefreshToken) return response;

    // Attempt silent token refresh
    const refreshResponse = await fetch(
      `${API_BASE_URL}/auth/refresh`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: storedRefreshToken }),
      }
    );

    if (!refreshResponse.ok) {
      // Refresh token is invalid/expired — clear storage
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      return response;
    }

    const tokens = await refreshResponse.json();
    localStorage.setItem(TOKEN_KEY, tokens.token);
    if (tokens.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    }

    // Retry the original request with the new access token
    const retryRequest = request.clone();
    retryRequest.headers.set("Authorization", `Bearer ${tokens.token}`);
    return fetch(retryRequest);
  },
});
