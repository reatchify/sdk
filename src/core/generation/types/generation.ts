/**
 * @fileoverview Type generation utilities for Reatchify SDK
 * @description This module handles TypeScript interface and type definition generation
 * @author Reatchify Team
 * @version 1.0.0
 */

import { ApiSchema } from "../../schema/schema";
import { ReatchifyConfig } from "../../config/config";

/**
 * Generates TypeScript type definitions from API schema
 * Creates interface definitions for all types defined in the schema
 *
 * @param schema - The API schema containing type definitions
 * @param config - The Reatchify configuration object
 * @returns A string containing all generated TypeScript interfaces
 *
 * @example
 * ```typescript
 * const typesCode = generateTypes(schema, config);
 * // Returns:
 * // export interface User {
 * //   id: string;
 * //   name: string;
 * //   email: string;
 * // }
 * ```
 */
export function generateTypes(
  schema: ApiSchema,
  config: ReatchifyConfig
): string {
  const includeComments = config.generation?.includeComments !== false;
  const includeJSDoc = config.generation?.includeJSDoc !== false;

  let types = includeComments
    ? "// Generated TypeScript interfaces\n// This file contains type definitions for API data models\n\n"
    : "";

  // Generate interface definitions
  for (const [typeName, typeDef] of Object.entries(schema.types)) {
    if (includeJSDoc) {
      types += `/** ${typeName} interface - Generated from API schema */\n`;
    }

    types += `export interface ${typeName} {\n`;
    types += Object.entries(typeDef as Record<string, string>)
      .map(([field, type]) => {
        const comment = includeJSDoc ? `  /** ${field} field */\n  ` : "  ";
        return `${comment}${field}: ${type};`;
      })
      .join("\n");
    types += `\n}\n\n`;
  }

  return types;
}

/**
 * Generates utility types for API operations
 * Creates helper types for request/response handling
 *
 * @param schema - The API schema containing endpoint definitions
 * @param config - The Reatchify configuration object
 * @returns A string containing utility type definitions
 *
 * @example
 * ```typescript
 * const utilityTypes = generateUtilityTypes(schema, config);
 * // Returns types for ApiResponse, ApiError, etc.
 * ```
 */
export function generateUtilityTypes(
  schema: ApiSchema,
  config: ReatchifyConfig
): string {
  const includeComments = config.generation?.includeComments !== false;
  const includeJSDoc = config.generation?.includeJSDoc !== false;

  let types = includeComments
    ? "// Utility types for API operations\n// This file contains helper types for request/response handling\n\n"
    : "";

  // Generate API Response type
  if (config.response?.pattern !== "promise") {
    if (includeJSDoc) {
      types += `/**\n`;
      types += ` * API Response interface for result pattern\n`;
      types += ` * @template T - The type of the response data\n`;
      types += ` */\n`;
    }
    types += `export interface ApiResponse<T = any> {\n`;
    types += `  data: T | null;\n`;
    types += `  error: Error | null;\n`;
    types += `}\n\n`;
  }

  // Generate API Error types
  if (config.errorHandling?.enabled !== false) {
    if (includeJSDoc) {
      types += `/**\n`;
      types += ` * API Error - Base class for API-related errors\n`;
      types += ` */\n`;
    }
    types += `export class ApiError extends Error {\n`;
    types += `  /** HTTP status code */\n`;
    types += `  statusCode?: number;\n`;
    types += `  /** Response data */\n`;
    types += `  response?: any;\n\n`;
    types += `  constructor(\n`;
    types += `    message: string,\n`;
    types += `    statusCode?: number,\n`;
    types += `    response?: any\n`;
    types += `  ) {\n`;
    types += `    super(message);\n`;
    types += `    this.name = 'ApiError';\n`;
    types += `    this.statusCode = statusCode;\n`;
    types += `    this.response = response;\n`;
    types += `  }\n`;
    types += `}\n\n`;
  }

  // Generate request parameter types for each endpoint
  for (const endpoint of schema.endpoints) {
    if (endpoint.parameters && endpoint.parameters.length > 0) {
      const typeName = `${endpoint.method}${endpoint.path
        .replace(/^\//, "")
        .replace(/\{([^}]+)\}/g, "$1")
        .replace(/\//g, "")}Params`;

      if (includeJSDoc) {
        types += `/**\n`;
        types += ` * Parameters for ${endpoint.method} ${endpoint.path}\n`;
        types += ` */\n`;
      }

      types += `export interface ${typeName} {\n`;
      for (const param of endpoint.parameters) {
        const optional = param.required ? "" : "?";
        const comment = includeJSDoc
          ? `  /** ${param.description || param.name} */\n  `
          : "  ";
        types += `${comment}${param.name}${optional}: ${param.type};\n`;
      }
      types += `}\n\n`;
    }
  }

  return types;
}
