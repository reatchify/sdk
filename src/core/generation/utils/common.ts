/**
 * @fileoverview Common utility functions for Reatchify SDK
 * @description This module contains general-purpose utility functions
 * @author Reatchify Team
 * @version 1.0.0
 */

/**
 * Creates a deep clone of an object
 * Recursively copies all nested objects and arrays
 *
 * @param obj - The object to clone
 * @returns A deep clone of the input object
 *
 * @example
 * ```typescript
 * const cloned = deepClone({ nested: { value: 42 } });
 * // Returns: { nested: { value: 42 } } (completely independent copy)
 * ```
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }

  if (obj instanceof Array) {
    return obj.map((item) => deepClone(item)) as unknown as T;
  }

  if (typeof obj === "object") {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }

  return obj;
}

/**
 * Checks if a value is empty (null, undefined, empty string, empty array, empty object)
 * Provides a comprehensive check for various empty states
 *
 * @param value - The value to check
 * @returns True if the value is empty, false otherwise
 *
 * @example
 * ```typescript
 * isEmpty(null); // true
 * isEmpty(''); // true
 * isEmpty([]); // true
 * isEmpty({}); // true
 * isEmpty('hello'); // false
 * ```
 */
export function isEmpty(value: any): boolean {
  if (value == null) {
    return true;
  }

  if (typeof value === "string" || Array.isArray(value)) {
    return value.length === 0;
  }

  if (typeof value === "object") {
    return Object.keys(value).length === 0;
  }

  return false;
}

/**
 * Capitalizes the first letter of a string
 * Converts the first character to uppercase and leaves the rest unchanged
 *
 * @param str - The string to capitalize
 * @returns The capitalized string
 *
 * @example
 * ```typescript
 * const capitalized = capitalize('hello world');
 * // Returns: "Hello world"
 * ```
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Converts a string to camelCase
 * Converts kebab-case, snake_case, or PascalCase to camelCase
 *
 * @param str - The string to convert
 * @returns The camelCase version of the string
 *
 * @example
 * ```typescript
 * toCamelCase('hello-world'); // "helloWorld"
 * toCamelCase('user_name'); // "userName"
 * toCamelCase('APIResponse'); // "aPIResponse"
 * ```
 */
export function toCamelCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ""))
    .replace(/^./, (char) => char.toLowerCase());
}

/**
 * Converts a string to PascalCase
 * Converts kebab-case, snake_case, or camelCase to PascalCase
 *
 * @param str - The string to convert
 * @returns The PascalCase version of the string
 *
 * @example
 * ```typescript
 * toPascalCase('hello-world'); // "HelloWorld"
 * toPascalCase('user_name'); // "UserName"
 * toPascalCase('apiResponse'); // "ApiResponse"
 * ```
 */
export function toPascalCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ""))
    .replace(/^./, (char) => char.toUpperCase());
}
