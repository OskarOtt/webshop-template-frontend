/**
 * Utilities for extracting human-readable messages from API errors.
 *
 * openapi-fetch returns the parsed response body as `error` on non-2xx responses.
 * Spring Boot typically includes a `status` and `message` field in the body.
 */

/** Returns the HTTP status code from a Spring Boot-style error body, if present. */
export function getApiErrorStatus(err: unknown): number | undefined {
  if (err && typeof err === "object" && "status" in err) {
    const s = (err as { status: unknown }).status;
    if (typeof s === "number") return s;
  }
  return undefined;
}

/**
 * Extracts a user-friendly message from a Spring Boot error response.
 * Handles several common formats:
 *   { message: "..." }
 *   { detail: "..." }                         (RFC 9457 / Problem Details)
 *   { errors: [{ defaultMessage: "..." }] }   (Spring @Valid field errors)
 *   { errors: { field: "message" } }          (custom map style)
 */
export function extractApiErrorMessage(err: unknown): string | undefined {
  if (!err || typeof err !== "object") return undefined;

  const e = err as Record<string, unknown>;

  // Field errors array (Spring @Valid)
  if (Array.isArray(e.errors) && e.errors.length > 0) {
    const messages = (e.errors as Record<string, unknown>[])
      .map((fe) => fe.defaultMessage ?? fe.message ?? fe.reason)
      .filter((m): m is string => typeof m === "string");
    if (messages.length > 0) return messages.join(" ");
  }

  // Field errors as an object map
  if (e.errors && typeof e.errors === "object" && !Array.isArray(e.errors)) {
    const messages = Object.values(e.errors as Record<string, unknown>)
      .filter((m): m is string => typeof m === "string");
    if (messages.length > 0) return messages.join(" ");
  }

  // Prefer detail (RFC 9457 Problem Details)
  if (typeof e.detail === "string" && e.detail) return e.detail;

  // Standard Spring Boot message field
  if (typeof e.message === "string" && e.message) return e.message;

  return undefined;
}
