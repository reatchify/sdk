/**
 * @fileoverview HTTP utility functions for Reatchify SDK
 * @description This module contains HTTP-related utility functions
 * @author Reatchify Team
 * @version 1.0.0
 */

/**
 * Builds a query string from an object of parameters
 * Converts key-value pairs into a URL-encoded query string
 *
 * @param params - Object containing query parameters
 * @returns URL-encoded query string starting with '?'
 *
 * @example
 * ```typescript
 * const query = buildQueryString({ page: 1, limit: 10 });
 * // Returns: "?page=1&limit=10"
 * ```
 */
export function buildQueryString(params: Record<string, any>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      query.append(key, String(value));
    }
  }
  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}

/**
 * Builds HTTP headers from an object
 * Creates a properly formatted headers object with common defaults
 *
 * @param headers - Object containing header key-value pairs
 * @returns Headers object with defaults applied
 *
 * @example
 * ```typescript
 * const headers = buildHeaders({ 'Authorization': 'Bearer token' });
 * // Returns: { 'Content-Type': 'application/json', 'Authorization': 'Bearer token' }
 * ```
 */
export function buildHeaders(
  headers: Record<string, string>
): Record<string, string> {
  return {
    "Content-Type": "application/json",
    ...headers,
  };
}

/**
 * Serializes request parameters for API calls
 * Converts complex objects to strings where needed
 *
 * @param params - Object containing parameters to serialize
 * @returns Object with serialized parameter values
 *
 * @example
 * ```typescript
 * const serialized = serializeParams({ data: { nested: 'value' } });
 * // Returns: { data: '{"nested":"value"}' }
 * ```
 */
export function serializeParams(
  params: Record<string, any>
): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "object" && value !== null) {
      result[key] = JSON.stringify(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}
