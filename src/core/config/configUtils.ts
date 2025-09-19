/**
 * @fileoverview Configuration management utilities for Reatchify SDK
 * @description This module handles configuration merging, validation, and project type detection
 * @author Reatchify Team
 * @version 1.0.0
 */

import * as fs from "fs";
import * as path from "path";
import { ReatchifyConfig, INTERNAL_API_CONFIG } from "./config";
import { detectProjectType } from "../project/projectTypeDetector";

/**
 * Gets the default output directory with smart fallback logic
 * Uses ./src/services, but falls back to ./src/services/reatchify if services folder exists
 */
function getDefaultOutputDir(): string {
  const servicesDir = "./src/services";
  const fallbackDir = "./src/services/reatchify";

  if (fs.existsSync(path.resolve(process.cwd(), servicesDir))) {
    return fallbackDir;
  }

  return servicesDir;
}

/**
 * Merges internal API defaults with user configuration
 * Internal settings are kept private, users can only override allowed fields
 *
 * @param userConfig - The user-provided configuration object
 * @returns A fully merged configuration object with defaults applied
 *
 * @example
 * ```typescript
 * const config = mergeConfigWithDefaults({
 *   httpClient: 'axios',
 *   stateManagement: 'zustand'
 * });
 * ```
 */
export function mergeConfigWithDefaults(
  userConfig: ReatchifyConfig
): ReatchifyConfig {
  const environment = process.env.NODE_ENV || "prod";
  const envConfig = userConfig.environments?.[environment] || {};

  return {
    // Basic configuration with defaults
    language: "ts",
    stateManagement: "zustand",
    httpClient: "axios",
    outputDir: getDefaultOutputDir(),
    projectType: "auto",

    // API Version - check environment-specific first, then top-level, then internal default
    apiVersion:
      envConfig.apiVersion ||
      userConfig.apiVersion ||
      INTERNAL_API_CONFIG.defaultVersion,

    // Merge other user config first (for top-level properties)
    ...userConfig,

    // Folder structure defaults (after user config to allow override)
    folderStructure: {
      types: "types",
      api: "api",
      client: "client",
      stores: "stores",
      ...userConfig.folderStructure,
    },

    // Client defaults (after user config to allow override)
    client: {
      enabled: true,
      className: "ReatchifyClient",
      exportAsDefault: false,
      includeUtils: true,
      ...userConfig.client,
    },

    // API defaults
    api: {
      enabled: true,
      namespaceName: "api",
      groupByResource: true,
      includeHttpClient: true,
      ...userConfig.api,
    },

    // Response defaults
    response: {
      pattern: "result",
      includeErrorClasses: true,
      ...userConfig.response,
    },

    // Plugin defaults
    plugins: {
      enabled: true,
      registryClassName: "PluginRegistry",
      includeDefaultPlugins: false,
      ...userConfig.plugins,
    },

    // Versioning defaults (internal API versioning)
    versioning: {
      enabled: true,
      headerName: "X-API-Version",
      versionFromPackage: false,
      ...userConfig.versioning,
    },

    // Error handling defaults
    errorHandling: {
      enabled: true,
      includeNetworkErrors: true,
      includeValidationErrors: true,
      ...userConfig.errorHandling,
    },

    // HTTP defaults (merged with internal)
    http: {
      timeout: INTERNAL_API_CONFIG.timeout,
      headers: {
        ...INTERNAL_API_CONFIG.headers,
        ...userConfig.http?.headers,
      },
      ...userConfig.http,
    },

    // Generation defaults
    generation: {
      includeComments: true,
      includeJSDoc: true,
      minify: false,
      sourceMap: false,
      declarationFiles: true,
      ...userConfig.generation,
    },

    // Advanced defaults
    advanced: {
      ...userConfig.advanced,
    },
  };
}

/**
 * Applies project type-specific optimizations to the configuration
 * This function modifies the configuration based on detected or specified project type
 *
 * @param config - The configuration object to optimize
 * @returns The optimized configuration with project-specific settings
 *
 * @example
 * ```typescript
 * const optimizedConfig = applyProjectTypeOptimizations(config);
 * // Returns config with Next.js-specific optimizations if project is Next.js
 * ```
 */
export function applyProjectTypeOptimizations(
  config: ReatchifyConfig
): ReatchifyConfig {
  const projectType = config.projectType || "auto";

  // If auto-detection is enabled, try to detect the project type
  if (projectType === "auto") {
    const detection = detectProjectType(process.cwd());
    config.projectType =
      detection.detectedType as ReatchifyConfig["projectType"];
  }

  // Apply project type-specific optimizations
  switch (config.projectType) {
    case "next":
      // Next.js optimizations
      config.httpClient = config.httpClient || "fetch"; // Prefer fetch in Next.js
      config.stateManagement = config.stateManagement || "zustand"; // Zustand works well with SSR
      break;

    case "qwik":
      // Qwik optimizations
      config.httpClient = config.httpClient || "fetch"; // Qwik prefers fetch
      config.stateManagement = config.stateManagement || "zustand"; // Light state management
      config.generation = {
        ...config.generation,
        minify: true, // Qwik benefits from smaller bundles
      };
      break;

    case "react":
    case "vite":
      // React/Vite optimizations
      config.httpClient = config.httpClient || "axios"; // Axios is popular in React ecosystem
      config.stateManagement = config.stateManagement || "zustand"; // Modern React state
      break;

    case "vue":
      // Vue.js optimizations
      config.httpClient = config.httpClient || "axios";
      config.stateManagement = config.stateManagement || "zustand"; // Pinia is Vue's official, but zustand works too
      break;

    case "svelte":
      // Svelte optimizations
      config.httpClient = config.httpClient || "fetch"; // Svelte prefers native fetch
      config.stateManagement = config.stateManagement || "zustand"; // Svelte stores are built-in, but zustand works
      config.generation = {
        ...config.generation,
        minify: true, // Svelte benefits from smaller bundles
      };
      break;

    case "angular":
      // Angular optimizations
      config.httpClient = config.httpClient || "fetch"; // Angular's HttpClient, but fetch for simplicity
      config.stateManagement = config.stateManagement || "zustand"; // NgRx is official, but zustand works
      config.language = config.language || "ts"; // Angular requires TypeScript
      break;

    case "vanilla":
    default:
      // Vanilla JS/TS - keep defaults
      break;
  }

  return config;
}
