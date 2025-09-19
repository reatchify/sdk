/**
 * @fileoverview Type file generation utilities for Reatchify SDK
 * @description This module handles the generation of individual type files
 * @author Reatchify Team
 * @version 1.0.0
 */

import { ApiSchema } from "../../schema/schema";
import { ReatchifyConfig } from "../../config/config";

/**
 * Generates individual type files for each type in the schema
 * Creates separate files for better organization and tree-shaking
 *
 * @param schema - The API schema containing type definitions
 * @param config - The Reatchify configuration object
 * @returns A record of filename to content mappings for type files
 *
 * @example
 * ```typescript
 * const typeFiles = generateTypesFiles(schema, config);
 * // Returns: { 'user.ts': 'export interface User { ... }', 'post.ts': '...' }
 * ```
 */
export function generateTypesFiles(
  schema: ApiSchema,
  config: ReatchifyConfig
): Record<string, string> {
  const files: Record<string, string> = {};
  const includeComments = config.generation?.includeComments !== false;
  const includeJSDoc = config.generation?.includeJSDoc !== false;

  // Generate individual type files
  for (const [typeName, typeDef] of Object.entries(schema.types)) {
    let content = includeComments
      ? `// Generated type for ${typeName}\n// This file contains TypeScript interfaces for API data models\n\n`
      : "";

    if (includeJSDoc) {
      content += `/** ${typeName} interface - Generated from API schema */\n`;
    }

    content += `export interface ${typeName} {\n`;
    content += Object.entries(typeDef as Record<string, string>)
      .map(([field, type]) => {
        const comment = includeJSDoc ? `  /** ${field} field */\n  ` : "  ";
        return `${comment}${field}: ${type};`;
      })
      .join("\n");
    content += `\n}\n`;

    files[`${typeName.toLowerCase()}.ts`] = content;
  }

  // Generate index file
  let indexContent = includeComments
    ? "// Type exports\n// This file exports all generated TypeScript interfaces\n\n"
    : "";
  indexContent += Object.keys(schema.types)
    .map((typeName) => `export * from './${typeName.toLowerCase()}';`)
    .join("\n");

  files["index.ts"] = indexContent;

  return files;
}
