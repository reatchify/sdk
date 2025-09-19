/**
 * @fileoverview File utility functions for Reatchify SDK
 * @description This module contains file and path-related utility functions
 * @author Reatchify Team
 * @version 1.0.0
 */

/**
 * Validates a file path for security and correctness
 * Ensures the path doesn't contain dangerous characters or patterns
 *
 * @param filePath - The file path to validate
 * @returns True if the path is valid, false otherwise
 *
 * @example
 * ```typescript
 * const isValid = validateFilePath('./src/types/user.ts');
 * // Returns: true
 * ```
 */
export function validateFilePath(filePath: string): boolean {
  try {
    // Check for dangerous patterns
    const dangerousPatterns = [
      /\.\./, // Parent directory traversal
      /^[\/\\]/, // Absolute paths
      /[<>:"|?*]/, // Invalid filename characters
      /^\s/, // Leading whitespace
      /\s$/, // Trailing whitespace
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(filePath)) {
        return false;
      }
    }

    // Check file extension
    const validExtensions = [".ts", ".js", ".json", ".d.ts"];
    const hasValidExtension = validExtensions.some((ext) =>
      filePath.endsWith(ext)
    );

    return hasValidExtension;
  } catch (error) {
    return false;
  }
}

/**
 * Normalizes a file path for consistent formatting
 * Converts backslashes to forward slashes and removes redundant segments
 *
 * @param filePath - The file path to normalize
 * @returns Normalized file path
 *
 * @example
 * ```typescript
 * const normalized = normalizeFilePath('src\\types\\user.ts');
 * // Returns: "src/types/user.ts"
 * ```
 */
export function normalizeFilePath(filePath: string): string {
  // Convert backslashes to forward slashes
  let normalized = filePath.replace(/\\/g, "/");

  // Remove redundant slashes
  normalized = normalized.replace(/\/+/g, "/");

  // Remove leading slash if present
  normalized = normalized.replace(/^\//, "");

  return normalized;
}

/**
 * Creates a safe filename from a potentially unsafe string
 * Removes invalid characters and ensures the filename is filesystem-safe
 *
 * @param name - The base name to convert to a safe filename
 * @param extension - Optional file extension (defaults to '.ts')
 * @returns A safe filename string
 *
 * @example
 * ```typescript
 * const safeName = createSafeFilename('User Profile!');
 * // Returns: "user-profile.ts"
 * ```
 */
export function createSafeFilename(name: string, extension?: string): string {
  const ext = extension || ".ts";

  // Convert to lowercase
  let safeName = name.toLowerCase();

  // Replace spaces and special characters with hyphens
  safeName = safeName.replace(/[^a-z0-9\-_]/g, "-");

  // Remove multiple consecutive hyphens
  safeName = safeName.replace(/-+/g, "-");

  // Remove leading/trailing hyphens
  safeName = safeName.replace(/^-+|-+$/g, "");

  // Ensure it's not empty
  if (!safeName) {
    safeName = "unnamed";
  }

  return `${safeName}${ext}`;
}
