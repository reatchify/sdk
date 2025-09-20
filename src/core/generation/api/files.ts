/**
 * @fileoverview API file generation utilities for Reatchify SDK
 * @description This module handles the generation of API operation files with HTTP request functions
 * @author Reatchify Team
 * @version 1.0.0
 */

import { ApiSchema } from "../../schema/schema";
import { ReatchifyConfig } from "../../config/config";
import { generateMethodName } from "../..";
import { generateParams } from "./utils";

/**
 * Generates API operation files from the API schema
 * Creates HTTP request functions for all endpoints, organized by resource or in a single file
 *
 * @param schema - The API schema containing endpoint definitions
 * @param config - The Reatchify configuration object
 * @returns A record of filename to content mappings for API files
 *
 * @example
 * ```typescript
 * const apiFiles = generateApiFiles(schema, config);
 * // Returns: { 'users.ts': '...', 'posts.ts': '...', 'index.ts': '...' }
 * ```
 */
export function generateApiFiles(
  schema: ApiSchema,
  config: ReatchifyConfig
): Record<string, string> {
  const files: Record<string, string> = {};
  const naming = config.naming || {
    clientPrefix: "",
    storePrefix: "use",
    hookPrefix: "use",
  };
  const apiConfig = config.api || {};
  const includeComments = config.generation?.includeComments !== false;
  const groupByResource = apiConfig.groupByResource !== false;
  const includeHttpClient = apiConfig.includeHttpClient !== false;

  // Get selected services or all services from schema
  const selectedServices = config.services?.include;
  const availableServices = getAvailableServices(schema);

  if (selectedServices) {
    // Validate selected services exist in schema
    const invalidServices = selectedServices.filter(service => !availableServices.includes(service));
    if (invalidServices.length > 0) {
      console.warn(`⚠️  Warning: The following services are not available in the schema: ${invalidServices.join(', ')}`);
      console.warn(`Available services: ${availableServices.join(', ')}`);
    }
  }

  const servicesToGenerate = selectedServices || availableServices;

  if (groupByResource) {
    // Group endpoints by resource and filter by selected services
    const resources: Record<string, typeof schema.endpoints> = {};
    for (const endpoint of schema.endpoints) {
      const resource = endpoint.path.split("/")[1] || "general";

      // Only include this resource if it's in the selected services
      if (servicesToGenerate.includes(resource)) {
        if (!resources[resource]) resources[resource] = [];
        resources[resource].push(endpoint);
      }
    }

    // Generate resource files
    for (const [resource, endpoints] of Object.entries(resources)) {
      let content = includeComments
        ? `// Generated API operations for ${resource}\n// This file contains HTTP request functions for ${resource} endpoints\n\n`
        : "";

      if (includeHttpClient) {
        content += `import { makeRequest } from '../${
          config.folderStructure?.client || "client"
        }/http';\n\n`;
      }

      for (const endpoint of endpoints) {
        const methodName = generateMethodName(endpoint);

        if (includeComments && endpoint.description) {
          content += `// ${endpoint.description}\n`;
        }

        if (config.generation?.includeJSDoc) {
          content += `/**\n`;
          content += ` * ${
            endpoint.description || `${endpoint.method} ${endpoint.path}`
          }\n`;
          if (endpoint.parameters && endpoint.parameters.length > 0) {
            endpoint.parameters.forEach((param) => {
              content += ` * @param {${param.type}} ${param.name} - ${
                param.description || "Parameter"
              }\n`;
            });
          }
          content += ` * @returns {Promise} API response\n`;
          content += ` */\n`;
        }

        content += `export const ${methodName} = async (${generateParams(
          endpoint.parameters || []
        )}) => {\n`;
        if (includeHttpClient) {
          const paramNames =
            endpoint.parameters?.map((p) => p.name).join(", ") || "";
          if (endpoint.parameters && endpoint.parameters.length > 0) {
            content += `  return makeRequest('${endpoint.method}', '${endpoint.path}', { params: { ${paramNames} } });\n`;
          } else {
            content += `  return makeRequest('${endpoint.method}', '${endpoint.path}');\n`;
          }
        } else {
          content += `  // TODO: Implement HTTP request\n`;
          content += `  throw new Error('HTTP client not configured');\n`;
        }
        content += "};\n\n";
      }

      files[`${resource}.ts`] = content;
    }

    // Generate index file
    let indexContent = includeComments
      ? "// API operation exports\n// This file exports all generated API functions\n\n"
      : "";
    indexContent += Object.keys(resources)
      .map((resource) => `export * from './${resource}';`)
      .join("\n");

    files["index.ts"] = indexContent;
  } else {
    // Generate single API file
    let content = includeComments
      ? "// Generated API operations\n// This file contains all HTTP request functions\n\n"
      : "";

    if (includeHttpClient) {
      content += `import { makeRequest } from '../${
        config.folderStructure?.client || "client"
      }/http';\n\n`;
    }

    // Filter endpoints by selected services
    const filteredEndpoints = schema.endpoints.filter(endpoint => {
      const resource = endpoint.path.split("/")[1] || "general";
      return servicesToGenerate.includes(resource);
    });

    for (const endpoint of filteredEndpoints) {
      const methodName = generateMethodName(endpoint);

      if (includeComments && endpoint.description) {
        content += `// ${endpoint.description}\n`;
      }

      if (config.generation?.includeJSDoc) {
        content += `/**\n`;
        content += ` * ${
          endpoint.description || `${endpoint.method} ${endpoint.path}`
        }\n`;
        if (endpoint.parameters && endpoint.parameters.length > 0) {
          endpoint.parameters.forEach((param) => {
            content += ` * @param {${param.type}} ${param.name} - ${
              param.description || "Parameter"
            }\n`;
          });
        }
        content += ` * @returns {Promise} API response\n`;
        content += ` */\n`;
      }

      content += `export const ${methodName} = async (${generateParams(
        endpoint.parameters || []
      )}) => {\n`;
      if (includeHttpClient) {
        const paramNames =
          endpoint.parameters?.map((p) => p.name).join(", ") || "";
        if (endpoint.parameters && endpoint.parameters.length > 0) {
          content += `  return makeRequest('${endpoint.method}', '${endpoint.path}', { params: { ${paramNames} } });\n`;
        } else {
          content += `  return makeRequest('${endpoint.method}', '${endpoint.path}');\n`;
        }
      } else {
        content += `  // TODO: Implement HTTP request\n`;
        content += `  throw new Error('HTTP client not configured');\n`;
      }
      content += "};\n\n";
    }

    files["index.ts"] = content;
  }

  return files;
}

/**
 * Extracts available service names from the API schema
 */
function getAvailableServices(schema: ApiSchema): string[] {
  const services = new Set<string>();
  for (const endpoint of schema.endpoints) {
    const resource = endpoint.path.split("/")[1] || "general";
    services.add(resource);
  }
  return Array.from(services);
}
