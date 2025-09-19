/**
 * @fileoverview Store hooks utilities for Reatchify SDK
 * @description This module handles the generation of custom hooks for stores
 * @author Reatchify Team
 * @version 1.0.0
 */

import { ApiSchema } from "../../schema/schema";
import { ReatchifyConfig } from "../../config/config";
import { generateMethodName } from "../api";

/**
 * Generates store hooks for easier consumption
 * Creates custom hooks that wrap store selectors and actions
 *
 * @param schema - The API schema containing endpoint definitions
 * @param config - The Reatchify configuration object
 * @returns A record of filename to content mappings for hook files
 *
 * @example
 * ```typescript
 * const hookFiles = generateStoreHooks(schema, config);
 * // Returns: { 'useUsers.ts': '...', 'usePosts.ts': '...' }
 * ```
 */
export function generateStoreHooks(
  schema: ApiSchema,
  config: ReatchifyConfig
): Record<string, string> {
  const files: Record<string, string> = {};
  const naming = config.naming || {
    clientPrefix: "",
    storePrefix: "use",
    hookPrefix: "use",
  };
  const includeComments = config.generation?.includeComments !== false;

  if (config.stateManagement === "zustand") {
    for (const endpoint of schema.endpoints) {
      const methodName = generateMethodName(endpoint);
      const storeName =
        methodName.charAt(0).toUpperCase() + methodName.slice(1);
      const hookName = `${naming.hookPrefix}${storeName}`;

      let content = includeComments
        ? `// Generated hook for ${endpoint.path}\n// This file provides a custom hook for ${storeName} store\n\n`
        : "";

      content += `import { ${naming.storePrefix}${storeName}Store } from '../stores/${storeName}Store';\n\n`;

      content += `/**\n`;
      content += ` * Custom hook for ${storeName} operations\n`;
      content += ` * @returns Object containing store state and actions\n`;
      content += ` */\n`;
      content += `export function ${hookName}() {\n`;
      content += `  return ${naming.storePrefix}${storeName}Store();\n`;
      content += `}\n`;

      files[`${hookName}.ts`] = content;
    }
  }

  return files;
}
