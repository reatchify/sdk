/**
 * @fileoverview Store validation utilities for Reatchify SDK
 * @description This module handles validation of store configuration
 * @author Reatchify Team
 * @version 1.0.0
 */

import { ReatchifyConfig } from "../../config/config";

/**
 * Validates store configuration
 * Ensures that the chosen state management library is properly configured
 *
 * @param config - The Reatchify configuration object
 * @returns Array of validation error messages, empty if valid
 *
 * @example
 * ```typescript
 * const errors = validateStoreConfig(config);
 * if (errors.length > 0) {
 *   console.error('Store configuration errors:', errors);
 * }
 * ```
 */
export function validateStoreConfig(config: ReatchifyConfig): string[] {
  const errors: string[] = [];

  if (config.stateManagement && config.stateManagement !== "none") {
    const validStateManagers = ["zustand", "redux", "mobx", "pinia"];
    if (!validStateManagers.includes(config.stateManagement)) {
      errors.push(
        `Unsupported state management library: ${config.stateManagement}`
      );
    }

    // Additional validation based on state manager
    if (
      config.stateManagement === "redux" &&
      config.response?.pattern === "result"
    ) {
      errors.push(
        "Redux state management works best with 'promise' response pattern"
      );
    }
  }

  return errors;
}
