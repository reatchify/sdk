/**
 * @fileoverview Schema management utilities for Reatchify SDK
 * @description This module handles API schema fetching, validation, and processing
 * @author Reatchify Team
 * @version 1.0.0
 */

import { ReatchifyConfig, INTERNAL_API_CONFIG } from "../config/config";
import { mergeConfigWithDefaults } from "../config/configUtils";

/**
 * API Schema interface representing the structure of API endpoints and types
 * This interface defines the expected format for API schema data
 */
export interface ApiSchema {
  /** Array of API endpoint definitions */
  endpoints: Array<{
    /** The HTTP path of the endpoint */
    path: string;
    /** HTTP method (GET, POST, PUT, DELETE, etc.) */
    method: string;
    /** Optional human-readable description */
    description?: string;
    /** Array of parameter definitions for the endpoint */
    parameters?: Array<{
      /** Parameter name */
      name: string;
      /** TypeScript type string */
      type: string;
      /** Whether the parameter is required */
      required: boolean;
      /** Optional description of the parameter */
      description?: string;
    }>;
    /** Response type definition */
    response?: {
      /** TypeScript type string for the response */
      type: string;
      /** Optional description of the response */
      description?: string;
    };
  }>;
  /** Record of type definitions keyed by type name */
  types: Record<string, any>;
}

/**
 * Fetches API schema from the configured endpoint
 * Attempts to fetch schema from internal API, falls back to mock schema on failure
 *
 * @param config - The Reatchify configuration object
 * @returns Promise resolving to the API schema
 * @throws Will not throw but logs warnings and returns mock schema on fetch failure
 *
 * @example
 * ```typescript
 * const schema = await fetchSchema(config);
 * console.log(schema.endpoints.length); // Number of endpoints
 * console.log(Object.keys(schema.types)); // Available types
 * ```
 */
export async function fetchSchema(config: ReatchifyConfig): Promise<ApiSchema> {
  // Use internal API configuration
  const mergedConfig = mergeConfigWithDefaults(config);
  const environment = process.env.NODE_ENV || "prod";
  const baseUrl =
    INTERNAL_API_CONFIG.baseUrls[
      environment as keyof typeof INTERNAL_API_CONFIG.baseUrls
    ] || INTERNAL_API_CONFIG.baseUrls.prod;
  const apiVersion =
    mergedConfig.apiVersion || INTERNAL_API_CONFIG.defaultVersion;

  try {
    // Try to fetch schema from internal API
    const response = await fetch(`${baseUrl}/${apiVersion}/schema`, {
      method: "GET",
      headers: {
        ...INTERNAL_API_CONFIG.headers,
        "X-API-Version": apiVersion,
      },
      signal: AbortSignal.timeout(INTERNAL_API_CONFIG.timeout),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.warn(
      "Failed to fetch schema from API, using mock schema:",
      error instanceof Error ? error.message : String(error)
    );
    // Fallback to mock schema
    return {
      endpoints: [
        {
          path: "/users",
          method: "GET",
          description: "Get all users",
          response: {
            type: "User[]",
          },
        },
        {
          path: "/users/{id}",
          method: "GET",
          description: "Get user by ID",
          parameters: [
            {
              name: "id",
              type: "string",
              required: true,
              description: "User ID",
            },
          ],
          response: {
            type: "User",
          },
        },
        {
          path: "/users",
          method: "POST",
          description: "Create a new user",
          parameters: [
            {
              name: "name",
              type: "string",
              required: true,
              description: "User name",
            },
            {
              name: "email",
              type: "string",
              required: true,
              description: "User email",
            },
          ],
          response: {
            type: "User",
          },
        },
        {
          path: "/users/{id}",
          method: "PUT",
          description: "Update user by ID",
          parameters: [
            {
              name: "id",
              type: "string",
              required: true,
              description: "User ID",
            },
            {
              name: "name",
              type: "string",
              required: false,
              description: "Updated user name",
            },
            {
              name: "email",
              type: "string",
              required: false,
              description: "Updated user email",
            },
          ],
          response: {
            type: "User",
          },
        },
        {
          path: "/users/{id}",
          method: "DELETE",
          description: "Delete user by ID",
          parameters: [
            {
              name: "id",
              type: "string",
              required: true,
              description: "User ID",
            },
          ],
        },
      ],
      types: {
        User: {
          id: "string",
          name: "string",
          email: "string",
          createdAt: "string",
          updatedAt: "string",
        },
      },
    };
  }
}

/**
 * Validates an API schema for required fields and structure
 * Performs basic validation to ensure schema integrity
 *
 * @param schema - The API schema to validate
 * @returns True if schema is valid, false otherwise
 *
 * @example
 * ```typescript
 * const isValid = validateSchema(schema);
 * if (!isValid) {
 *   console.error('Invalid schema structure');
 * }
 * ```
 */
export function validateSchema(schema: ApiSchema): boolean {
  try {
    // Check if schema has required properties
    if (!schema || typeof schema !== "object") {
      return false;
    }

    // Validate endpoints array
    if (!Array.isArray(schema.endpoints)) {
      return false;
    }

    // Validate each endpoint
    for (const endpoint of schema.endpoints) {
      if (!endpoint.path || !endpoint.method) {
        return false;
      }

      // Validate HTTP method
      const validMethods = [
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "HEAD",
        "OPTIONS",
      ];
      if (!validMethods.includes(endpoint.method.toUpperCase())) {
        return false;
      }

      // Validate parameters if present
      if (endpoint.parameters) {
        if (!Array.isArray(endpoint.parameters)) {
          return false;
        }

        for (const param of endpoint.parameters) {
          if (
            !param.name ||
            !param.type ||
            typeof param.required !== "boolean"
          ) {
            return false;
          }
        }
      }
    }

    // Validate types object
    if (!schema.types || typeof schema.types !== "object") {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Schema validation error:", error);
    return false;
  }
}

/**
 * Normalizes an API schema to ensure consistent structure
 * Applies transformations to make schema processing more reliable
 *
 * @param schema - The API schema to normalize
 * @returns The normalized schema
 *
 * @example
 * ```typescript
 * const normalizedSchema = normalizeSchema(rawSchema);
 * // Schema now has consistent structure and defaults
 * ```
 */
export function normalizeSchema(schema: ApiSchema): ApiSchema {
  const normalized: ApiSchema = {
    endpoints: [],
    types: { ...schema.types },
  };

  // Normalize endpoints
  for (const endpoint of schema.endpoints) {
    normalized.endpoints.push({
      ...endpoint,
      method: endpoint.method.toUpperCase(),
      parameters:
        endpoint.parameters?.map((param) => ({
          ...param,
          required: param.required ?? false,
          type: param.type || "any",
        })) || [],
    });
  }

  return normalized;
}
