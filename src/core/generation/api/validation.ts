/**
 * @fileoverview API validation utilities for Reatchify SDK
 * @description This module handles validation of API endpoint definitions
 * @author Reatchify Team
 * @version 1.0.0
 */

import { ApiSchema } from "../../schema/schema";

/**
 * Validates API endpoint definitions in the schema
 * Ensures that all endpoints have required properties and valid configurations
 *
 * @param schema - The API schema to validate
 * @returns Array of validation error messages, empty if valid
 *
 * @example
 * ```typescript
 * const errors = validateApiEndpoints(schema);
 * if (errors.length > 0) {
 *   console.error('API validation errors:', errors);
 * }
 * ```
 */
export function validateApiEndpoints(schema: ApiSchema): string[] {
  const errors: string[] = [];

  for (const endpoint of schema.endpoints) {
    // Validate required fields
    if (!endpoint.path) {
      errors.push(`Endpoint missing required 'path' field`);
      continue;
    }

    if (!endpoint.method) {
      errors.push(
        `Endpoint '${endpoint.path}' missing required 'method' field`
      );
      continue;
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
      errors.push(
        `Endpoint '${endpoint.path}' has invalid method '${endpoint.method}'`
      );
    }

    // Validate path format
    if (!endpoint.path.startsWith("/")) {
      errors.push(`Endpoint path '${endpoint.path}' should start with '/'`);
    }

    // Validate parameters
    if (endpoint.parameters) {
      const paramNames = new Set<string>();
      for (const param of endpoint.parameters) {
        if (!param.name) {
          errors.push(
            `Parameter in endpoint '${endpoint.path}' missing required 'name' field`
          );
          continue;
        }

        if (!param.type) {
          errors.push(
            `Parameter '${param.name}' in endpoint '${endpoint.path}' missing required 'type' field`
          );
          continue;
        }

        // Check for duplicate parameter names
        if (paramNames.has(param.name)) {
          errors.push(
            `Duplicate parameter name '${param.name}' in endpoint '${endpoint.path}'`
          );
        }
        paramNames.add(param.name);

        // Check if path parameter is defined in path
        if (
          endpoint.path.includes(`{${param.name}}`) &&
          param.required === false
        ) {
          errors.push(
            `Path parameter '${param.name}' in endpoint '${endpoint.path}' should be required`
          );
        }
      }
    }

    // Validate response type
    if (endpoint.response?.type) {
      // Check if response type is defined in schema types
      const responseType = endpoint.response.type.replace(/\[\]$/, ""); // Remove array notation
      if (!schema.types[responseType] && !isBuiltInType(responseType)) {
        errors.push(
          `Undefined response type '${responseType}' referenced in endpoint '${endpoint.path}'`
        );
      }
    }
  }

  return errors;
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
