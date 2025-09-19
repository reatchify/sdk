/**
 * @fileoverview API utility functions for Reatchify SDK
 * @description This module contains utility functions for API generation
 * @author Reatchify Team
 * @version 1.0.0
 */

/**
 * Generate method name based on HTTP method and path
 * Converts endpoint information into a camelCase method name
 *
 * @param endpoint - The endpoint definition containing method and path
 * @returns A camelCase method name for the API operation
 *
 * @example
 * ```typescript
 * const methodName = generateMethodName({ method: 'GET', path: '/users' });
 * // Returns: 'getUsers'
 *
 * const methodName = generateMethodName({ method: 'GET', path: '/users/{id}' });
 * // Returns: 'getUsersById'
 * ```
 */
export function generateMethodName(endpoint: {
  method: string;
  path: string;
  parameters?: Array<{ name: string; type: string; required: boolean }>;
}): string {
  const { method, path, parameters = [] } = endpoint;

  // Extract resource name from path (e.g., "/users" -> "users", "/users/{id}" -> "users")
  const pathParts = path.split("/").filter((p) => p && !p.startsWith("{"));
  const resource = pathParts[0] || "operation";

  // Convert to camelCase
  const camelResource = resource.charAt(0).toLowerCase() + resource.slice(1);

  // Check if endpoint has ID parameter
  const hasIdParam = parameters.some(
    (p) => p.name === "id" || p.name.toLowerCase().includes("id")
  );

  // Generate method name based on HTTP method
  let methodPrefix = "";
  switch (method.toUpperCase()) {
    case "GET":
      methodPrefix = "get";
      break;
    case "POST":
      methodPrefix = "create";
      break;
    case "PUT":
    case "PATCH":
      methodPrefix = "update";
      break;
    case "DELETE":
      methodPrefix = "delete";
      break;
    default:
      methodPrefix = "operation";
  }

  // Combine prefix with resource and add "ById" if needed
  const baseName =
    methodPrefix +
    camelResource.charAt(0).toUpperCase() +
    camelResource.slice(1);
  return hasIdParam ? baseName + "ById" : baseName;
}

/**
 * Generate parameter destructuring string for function signatures
 * Creates TypeScript parameter declarations with proper typing
 *
 * @param parameters - Array of parameter definitions
 * @returns A string representing the parameter destructuring pattern
 *
 * @example
 * ```typescript
 * const params = generateParams([
 *   { name: 'id', type: 'string', required: true },
 *   { name: 'limit', type: 'number', required: false }
 * ]);
 * // Returns: '{ id, limit }: { id: string; limit?: number; }'
 * ```
 */
export function generateParams(
  parameters: Array<{ name: string; type: string; required: boolean }>
): string {
  if (parameters.length === 0) return "";

  const destructuredParams = parameters.map((p) => p.name).join(", ");
  const typeAnnotation = parameters
    .map((p) => `${p.name}${p.required ? "" : "?"}: ${p.type}`)
    .join(", ");
  return `{ ${destructuredParams} }: { ${typeAnnotation} }`;
}

/**
 * Checks if a type name is a built-in TypeScript type
 * @param typeName - The type name to check
 * @returns True if the type is built-in, false otherwise
 */
function isBuiltInType(typeName: string): boolean {
  const builtInTypes = [
    "string",
    "number",
    "boolean",
    "any",
    "unknown",
    "void",
    "null",
    "undefined",
    "object",
    "Array",
    "Record",
    "Partial",
    "Required",
    "Pick",
    "Omit",
  ];
  return builtInTypes.includes(typeName);
}
