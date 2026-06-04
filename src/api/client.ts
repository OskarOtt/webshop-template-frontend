import createClient from "openapi-fetch";
import type { paths } from "../generated/schema.d.ts";

export const apiClient = createClient<paths>({
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080",
});

// Inject stored JWT token into every request that needs it
apiClient.use({
  onRequest({ request }) {
    const token = localStorage.getItem("auth_token");
    if (token) {
      request.headers.set("Authorization", `Bearer ${token}`);
    }
    return request;
  },
});
