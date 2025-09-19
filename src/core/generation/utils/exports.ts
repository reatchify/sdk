/**
 * @fileoverview Index generation utilities for Reatchify SDK
 * @description This module handles the generation of index files
 * @author Reatchify Team
 * @version 1.0.0
 */

import { ReatchifyConfig } from "../../config/config";

/**
 * Generates an index file that exports all SDK modules
 * Creates the main entry point for the generated SDK
 *
 * @param config - The Reatchify configuration object
 * @returns A string containing the index file content
 *
 * @example
 * ```typescript
 * const indexCode = generateIndexFile(config);
 * // Returns: export * from './types'; export * from './api'; ...
 * ```
 */
export function generateIndexFile(config: ReatchifyConfig): string {
  const includeComments = config.generation?.includeComments !== false;

  let index = includeComments
    ? "// SDK exports\n// This file provides the main entry point for the generated SDK\n\n"
    : "";

  const folderConfig = config.folderStructure || {};
  const typesDir = folderConfig.types || "types";
  const apiDir = folderConfig.api || "api";
  const clientDir = folderConfig.client || "client";
  const storesDir = folderConfig.stores || "stores";

  index += `export * from './${typesDir}';\n`;
  index += `export * from './${apiDir}';\n`;
  index += `export * from './${clientDir}';\n`;

  if (config.stateManagement && config.stateManagement !== "none") {
    index += `export * from './${storesDir}';\n`;
  }

  return index;
}

/**
 * Generates the main index file for the entire SDK
 * Creates a comprehensive export file for all generated modules
 *
 * @param config - The Reatchify configuration object
 * @returns A string containing the main index file content
 *
 * @example
 * ```typescript
 * const mainIndex = generateMainIndexFile(config);
 * // Returns comprehensive exports for the entire SDK
 * ```
 */
export function generateMainIndexFile(config: ReatchifyConfig): string {
  const includeComments = config.generation?.includeComments !== false;

  let index = includeComments
    ? "// Reatchify SDK\n// This file exports all generated modules and utilities\n\n"
    : "";

  // Export types
  index += `// Type definitions\n`;
  index += `export type * from './types';\n\n`;

  // Export API functions
  index += `// API operations\n`;
  index += `export * from './api';\n\n`;

  // Export client
  index += `// HTTP client\n`;
  index += `export * from './client';\n\n`;

  // Export stores if enabled
  if (config.stateManagement && config.stateManagement !== "none") {
    index += `// State management\n`;
    index += `export * from './stores';\n\n`;
  }

  return index;
}
