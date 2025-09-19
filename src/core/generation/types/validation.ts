/**
 * @fileoverview Type validation utilities for Reatchify SDK
 * @description This module handles validation of type definitions
 * @author Reatchify Team
 * @version 1.0.0
 */

import { ApiSchema } from "../../schema/schema";

/**
 * Validates type definitions in the schema
 * Ensures that all referenced types are properly defined
 *
 * @param schema - The API schema to validate
 * @returns Array of validation error messages, empty if valid
 *
 * @example
 * ```typescript
 * const errors = validateTypes(schema);
 * if (errors.length > 0) {
 *   console.error('Type validation errors:', errors);
 * }
 * ```
 */
export function validateTypes(schema: ApiSchema): string[] {
  const errors: string[] = [];
  const definedTypes = new Set(Object.keys(schema.types));

  // Check for undefined types in responses
  for (const endpoint of schema.endpoints) {
    if (endpoint.response?.type) {
      const typeName = endpoint.response.type.replace(/\[\]$/, ""); // Remove array notation
      if (!definedTypes.has(typeName) && !isBuiltInType(typeName)) {
        errors.push(
          `Undefined type '${typeName}' referenced in ${endpoint.method} ${endpoint.path} response`
        );
      }
    }

    // Check parameter types
    if (endpoint.parameters) {
      for (const param of endpoint.parameters) {
        const typeName = param.type.replace(/\[\]$/, ""); // Remove array notation
        if (!definedTypes.has(typeName) && !isBuiltInType(typeName)) {
          errors.push(
            `Undefined type '${typeName}' referenced in ${endpoint.method} ${endpoint.path} parameter '${param.name}'`
          );
        }
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
