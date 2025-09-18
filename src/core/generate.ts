// Copilot: Code generation utilities for Reatchify SDK

import * as fs from "fs";
import * as path from "path";
import axios from "axios";
import { execSync } from "child_process";
import { ReatchifyConfig, INTERNAL_API_CONFIG } from "../core/config";

/**
 * Merges internal API defaults with user configuration
 * Internal settings are kept private, users can only override allowed fields
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
    outputDir: "./src/generated/reatchify",
    projectType: "auto",

    // API Version - check environment-specific first, then top-level, then internal default
    apiVersion:
      envConfig.apiVersion ||
      userConfig.apiVersion ||
      INTERNAL_API_CONFIG.defaultVersion,

    // Folder structure defaults
    folderStructure: {
      types: "types",
      api: "api",
      client: "client",
      stores: "stores",
      ...userConfig.folderStructure,
    },

    // Client defaults
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

    // Merge other user config
    ...userConfig,
  };
}

export interface ApiSchema {
  endpoints: Array<{
    path: string;
    method: string;
    description?: string;
    parameters?: Array<{
      name: string;
      type: string;
      required: boolean;
      description?: string;
    }>;
    response?: {
      type: string;
      description?: string;
    };
  }>;
  types: Record<string, any>;
}

export async function fetchSchema(config: ReatchifyConfig): Promise<ApiSchema> {
  // Use internal API configuration
  const mergedConfig = mergeConfigWithDefaults(config);
  const environment = process.env.NODE_ENV || "prod";
  const baseUrl =
    INTERNAL_API_CONFIG.baseUrls[
      environment as keyof typeof INTERNAL_API_CONFIG.baseUrls
    ] || INTERNAL_API_CONFIG.baseUrls.prod;
  const apiVersion =
    mergedConfig.apiVersion || INTERNAL_API_CONFIG.defaultVersion;

  try {
    // Try to fetch schema from internal API
    const response = await axios.get(`${baseUrl}/${apiVersion}/schema`, {
      headers: {
        ...INTERNAL_API_CONFIG.headers,
        "X-API-Version": apiVersion,
      },
      timeout: INTERNAL_API_CONFIG.timeout,
    });

    return response.data;
  } catch (error) {
    console.warn(
      "Failed to fetch schema from API, using mock schema:",
      error instanceof Error ? error.message : String(error)
    );
    // Fallback to mock schema
    return {
      endpoints: [
        {
          path: "/users",
          method: "GET",
          description: "Get all users",
          response: {
            type: "User[]",
          },
        },
        {
          path: "/users/{id}",
          method: "GET",
          description: "Get user by ID",
          parameters: [
            {
              name: "id",
              type: "string",
              required: true,
              description: "User ID",
            },
          ],
          response: {
            type: "User",
          },
        },
      ],
      types: {
        User: {
          id: "string",
          name: "string",
          email: "string",
        },
      },
    };
  }
}

export function generateTypes(
  schema: ApiSchema,
  config: ReatchifyConfig
): string {
  let types = "// Generated types\n\n";

  // Generate interface definitions
  for (const [typeName, typeDef] of Object.entries(schema.types)) {
    types += `export interface ${typeName} {\n`;
    for (const [field, fieldType] of Object.entries(
      typeDef as Record<string, string>
    )) {
      types += `  ${field}: ${fieldType};\n`;
    }
    types += "}\n\n";
  }

  return types;
}

export function generateClient(
  schema: ApiSchema,
  config: ReatchifyConfig
): string {
  const naming = config.naming || {
    clientPrefix: "",
    storePrefix: "use",
    hookPrefix: "use",
  };

  let client = "// Generated API client\n\n";
  client += `import ${config.httpClient} from "${config.httpClient}";\n\n`;

  client += "const API_BASE_URL = process.env.REACTIFY_API_BASE_URL || '';\n\n";
  client += `const apiClient = ${config.httpClient}.create({\n`;
  client += "  baseURL: API_BASE_URL,\n";
  client += "});\n\n";

  // Generate API methods
  for (const endpoint of schema.endpoints) {
    const methodName =
      naming.clientPrefix +
      endpoint.path
        .replace(/^\//, "")
        .replace(/\{([^}]+)\}/g, "_$1")
        .replace(/\//g, "_");

    client += `export async function ${methodName}(${generateParams(
      endpoint.parameters || []
    )}) {\n`;
    if (endpoint.parameters && endpoint.parameters.length > 0) {
      let url = endpoint.path;
      for (const param of endpoint.parameters) {
        url = url.replace(`{${param.name}}`, `\${${param.name}}`);
      }
      client += `  const response = await apiClient.${endpoint.method.toLowerCase()}(\`${url}\`);\n`;
    } else {
      client += `  const response = await apiClient.${endpoint.method.toLowerCase()}("${
        endpoint.path
      }");\n`;
    }
    client += "  return response.data;\n";
    client += "}\n\n";
  }

  return client;
}

function generateParams(
  parameters: Array<{ name: string; type: string; required: boolean }>
): string {
  if (parameters.length === 0) return "";

  const destructuredParams = parameters.map((p) => p.name).join(", ");
  const typeAnnotation = parameters
    .map((p) => `${p.name}: ${p.type}`)
    .join(", ");
  return `{ ${destructuredParams} }: { ${typeAnnotation} }`;
}

/**
 * Apply project type-specific optimizations to the configuration
 */
function applyProjectTypeOptimizations(
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

/**
 * Detect project type from current working directory
 */
function detectProjectType(projectRoot: string): {
  detectedType: string;
  confidence: "high" | "medium" | "low";
} {
  try {
    const packageJsonPath = path.join(projectRoot, "package.json");
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
      const deps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      // Next.js detection
      if (deps["next"]) {
        return { detectedType: "next", confidence: "high" };
      }
      // Qwik detection
      else if (deps["@builder.io/qwik"] || deps["qwik"]) {
        return { detectedType: "qwik", confidence: "high" };
      }
      // Vite + React detection
      else if (deps["vite"] && (deps["react"] || deps["@types/react"])) {
        return { detectedType: "vite", confidence: "high" };
      }
      // Vue detection
      else if (deps["vue"] || deps["@vue/cli-service"]) {
        return { detectedType: "vue", confidence: "high" };
      }
      // Svelte detection
      else if (deps["svelte"]) {
        return { detectedType: "svelte", confidence: "high" };
      }
      // Angular detection
      else if (deps["@angular/core"] || deps["@angular/cli"]) {
        return { detectedType: "angular", confidence: "high" };
      }
      // React (Create React App or similar)
      else if (deps["react"] && deps["react-scripts"]) {
        return { detectedType: "react", confidence: "high" };
      }
      // Generic React
      else if (deps["react"]) {
        return { detectedType: "react", confidence: "medium" };
      }
    }

    // Check for framework-specific files
    if (
      fs.existsSync(path.join(projectRoot, "next.config.js")) ||
      fs.existsSync(path.join(projectRoot, "next.config.mjs")) ||
      fs.existsSync(path.join(projectRoot, "next.config.ts"))
    ) {
      return { detectedType: "next", confidence: "high" };
    }

    if (
      fs.existsSync(path.join(projectRoot, "vite.config.js")) ||
      fs.existsSync(path.join(projectRoot, "vite.config.ts")) ||
      fs.existsSync(path.join(projectRoot, "vite.config.mjs"))
    ) {
      return { detectedType: "vite", confidence: "high" };
    }

    if (fs.existsSync(path.join(projectRoot, "qwik-city.config.ts"))) {
      return { detectedType: "qwik", confidence: "high" };
    }

    if (fs.existsSync(path.join(projectRoot, "angular.json"))) {
      return { detectedType: "angular", confidence: "high" };
    }

    if (fs.existsSync(path.join(projectRoot, "svelte.config.js"))) {
      return { detectedType: "svelte", confidence: "high" };
    }
  } catch (error) {
    // Fall back to vanilla if detection fails
  }

  return { detectedType: "vanilla", confidence: "low" };
}

export async function generateCode(config: ReatchifyConfig): Promise<void> {
  // Merge user config with internal defaults
  const mergedConfig = mergeConfigWithDefaults(config);
  const schema = await fetchSchema(mergedConfig);

  // Apply project type-specific optimizations
  const optimizedConfig = applyProjectTypeOptimizations(mergedConfig);

  const outputDir = path.resolve(
    process.cwd(),
    config.outputDir || "./src/generated/reatchify"
  );
  fs.mkdirSync(outputDir, { recursive: true });

  // Install dependencies
  await installDependencies(optimizedConfig);

  // Get folder structure from config
  const folderConfig = config.folderStructure || {};
  const typesDirName = folderConfig.types || "types";
  const apiDirName = folderConfig.api || "api";
  const clientDirName = folderConfig.client || "client";
  const storesDirName = folderConfig.stores || "stores";

  // Create folder structure
  const typesDir = path.join(outputDir, typesDirName);
  const apiDir = path.join(outputDir, apiDirName);
  const clientDir = path.join(outputDir, clientDirName);

  fs.mkdirSync(typesDir, { recursive: true });
  fs.mkdirSync(apiDir, { recursive: true });
  fs.mkdirSync(clientDir, { recursive: true });

  // Generate types if enabled
  if (config.generation?.includeComments !== false) {
    const typesFiles = generateTypesFiles(schema, config);
    for (const [filename, content] of Object.entries(typesFiles)) {
      fs.writeFileSync(path.join(typesDir, filename), content);
    }
  }

  // Generate API operations if enabled
  if (config.api?.enabled !== false) {
    const apiFiles = generateApiFiles(schema, config);
    for (const [filename, content] of Object.entries(apiFiles)) {
      fs.writeFileSync(path.join(apiDir, filename), content);
    }
  }

  // Generate client core if enabled
  if (config.client?.enabled !== false) {
    const clientFiles = generateClientFiles(schema, config, mergedConfig);
    for (const [filename, content] of Object.entries(clientFiles)) {
      fs.writeFileSync(path.join(clientDir, filename), content);
    }
  }

  // Generate stores if state management is enabled
  if (config.stateManagement !== "none") {
    const storesDir = path.join(outputDir, storesDirName);
    fs.mkdirSync(storesDir, { recursive: true });

    const storeFiles = generateStoreFiles(schema, config);
    for (const [filename, content] of Object.entries(storeFiles)) {
      fs.writeFileSync(path.join(storesDir, filename), content);
    }
  }

  // Generate main index file
  const indexCode = generateMainIndexFile(config);
  fs.writeFileSync(path.join(outputDir, "index.ts"), indexCode);

  // Run post-generation hooks
  if (config.advanced?.hooks?.afterGenerate) {
    config.advanced.hooks.afterGenerate();
  }
}

async function installDependencies(config: ReatchifyConfig): Promise<void> {
  const dependencies = [];

  // HTTP client dependencies
  if (config.httpClient === "axios") {
    dependencies.push("axios");
  }

  // State management dependencies
  if (config.stateManagement === "zustand") {
    dependencies.push("zustand");
  } else if (config.stateManagement === "redux") {
    dependencies.push("redux", "react-redux", "@reduxjs/toolkit");
  }

  // Additional dependencies based on config
  if (config.http?.retry?.enabled) {
    dependencies.push("axios-retry"); // for axios retry functionality
  }

  if (config.plugins?.includeDefaultPlugins) {
    // Add any default plugin dependencies
  }

  if (dependencies.length > 0) {
    console.log(`Installing dependencies: ${dependencies.join(", ")}`);
    try {
      execSync(`npm install ${dependencies.join(" ")}`, { stdio: "inherit" });
    } catch (error) {
      console.warn(
        "Failed to install dependencies automatically. Please install them manually."
      );
    }
  }
}

function generateStoreFiles(
  schema: ApiSchema,
  config: ReatchifyConfig
): Record<string, string> {
  const files: Record<string, string> = {};
  const naming = config.naming || {
    clientPrefix: "",
    storePrefix: "use",
    hookPrefix: "use",
  };

  if (config.stateManagement === "zustand") {
    files["index.ts"] = `// Zustand stores
export * from './apiStore';
`;

    // Export individual endpoint stores
    for (const endpoint of schema.endpoints) {
      const storeName = endpoint.path
        .replace(/^\//, "")
        .replace(/\{([^}]+)\}/g, "_$1")
        .replace(/\//g, "_");
      files["index.ts"] += `export * from './${storeName}Store';\n`;
    }

    files["apiStore.ts"] = `// Generated Zustand API store

import { create } from 'zustand';

interface ApiState {
  loading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const ${naming.storePrefix}ApiStore = create<ApiState>((set) => ({
  loading: false,
  error: null,
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
`;

    // Generate individual stores for each endpoint
    for (const endpoint of schema.endpoints) {
      const storeName = endpoint.path
        .replace(/^\//, "")
        .replace(/\{([^}]+)\}/g, "_$1")
        .replace(/\//g, "_");

      const resource = endpoint.path.split("/")[1] || "general";
      const functionName = storeName;

      files[`${storeName}Store.ts`] = `// Generated store for ${endpoint.path}

import { create } from 'zustand';
import { ${functionName} } from '../api/${resource}';

interface ${storeName}State {
  data: any;
  loading: boolean;
  error: string | null;
  fetch: (${generateParams(endpoint.parameters || [])}) => Promise<void>;
}

export const ${
        naming.storePrefix
      }${storeName}Store = create<${storeName}State>((set) => ({
  data: null,
  loading: false,
  error: null,
  fetch: async (${generateParams(endpoint.parameters || [])}) => {
    set({ loading: true, error: null });
    try {
      const data = await ${functionName}(${
        endpoint.parameters
          ? `{ ${endpoint.parameters.map((p) => p.name).join(", ")} }`
          : ""
      });
      set({ data, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
}));
`;
    }
  } else if (config.stateManagement === "redux") {
    files["index.ts"] = `// Redux stores
export * from './store';
export * from './apiSlice';
`;

    files["store.ts"] = `// Generated Redux store

import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './apiSlice';

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
`;

    files["apiSlice.ts"] = `// Generated Redux API slice

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL = process.env.REACTIFY_API_BASE_URL || '';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  endpoints: (builder) => ({
    // TODO: Add endpoints based on schema
  }),
});
`;
  }

  return files;
}

function generateIndexFile(config: ReatchifyConfig): string {
  let index = `// Generated Reatchify SDK
export * from './types';
export * from './client';
`;

  if (config.stateManagement !== "none") {
    index += `export * from './stores';
`;
  }

  return index;
}

function generateTypesFiles(
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

function generateApiFiles(
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

  if (groupByResource) {
    // Group endpoints by resource
    const resources: Record<string, typeof schema.endpoints> = {};
    for (const endpoint of schema.endpoints) {
      const resource = endpoint.path.split("/")[1] || "general";
      if (!resources[resource]) resources[resource] = [];
      resources[resource].push(endpoint);
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
        const methodName = endpoint.path
          .replace(/^\//, "")
          .replace(/\{([^}]+)\}/g, "_$1")
          .replace(/\//g, "_");

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

        content += `export async function ${methodName}(${generateParams(
          endpoint.parameters || []
        )}) {\n`;
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
        content += "}\n\n";
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

    for (const endpoint of schema.endpoints) {
      const methodName = endpoint.path
        .replace(/^\//, "")
        .replace(/\{([^}]+)\}/g, "_$1")
        .replace(/\//g, "_");

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

      content += `export async function ${methodName}(${generateParams(
        endpoint.parameters || []
      )}) {\n`;
      if (includeHttpClient) {
        content += `  return makeRequest('${endpoint.method}', '${
          endpoint.path
        }'${
          endpoint.parameters
            ? `, { params: { ${endpoint.parameters
                .map((p) => p.name)
                .join(", ")} } }`
            : ""
        });\n`;
      } else {
        content += `  // TODO: Implement HTTP request\n`;
        content += `  throw new Error('HTTP client not configured');\n`;
      }
      content += "}\n\n";
    }

    files["index.ts"] = content;
  }

  return files;
}

function generateClientFiles(
  schema: ApiSchema,
  config: ReatchifyConfig,
  mergedConfig: ReatchifyConfig
): Record<string, string> {
  const files: Record<string, string> = {};
  const clientConfig = config.client || {};
  const responseConfig = config.response || {};
  const pluginsConfig = config.plugins || {};
  const errorConfig = config.errorHandling || {};
  const httpConfig = config.http || {};
  const versioningConfig = config.versioning || {};
  const includeComments = config.generation?.includeComments !== false;

  // HTTP client wrapper
  if (config.api?.includeHttpClient !== false) {
    let httpContent = includeComments
      ? "// HTTP client wrapper\n// This file provides HTTP request functionality with configurable response patterns\n\n"
      : "";

    if (config.httpClient === "axios") {
      httpContent += `import ${config.httpClient} from '${config.httpClient}';\n\n`;
      httpContent += `const API_BASE_URL = process.env.REACTIFY_API_BASE_URL || '${INTERNAL_API_CONFIG.baseUrls.prod}';\n\n`;
      httpContent += `const httpClient = ${config.httpClient}.create({\n`;
      httpContent += `  baseURL: API_BASE_URL,\n`;
      if (httpConfig.timeout) {
        httpContent += `  timeout: ${httpConfig.timeout},\n`;
      }
      if (httpConfig.headers) {
        httpContent += `  headers: ${JSON.stringify(
          httpConfig.headers,
          null,
          2
        )},\n`;
      }
      httpContent += "});\n\n";
    } else {
      httpContent += `const API_BASE_URL = process.env.REACTIFY_API_BASE_URL || '${INTERNAL_API_CONFIG.baseUrls.prod}';\n\n`;
    }

    if (responseConfig.pattern !== "promise") {
      httpContent += `/**\n`;
      httpContent += ` * API Response interface for result pattern\n`;
      httpContent += ` * @template T - The type of the response data\n`;
      httpContent += ` */\n`;
      httpContent += `export interface ApiResponse<T = any> {\n`;
      httpContent += `  data: T | null;\n`;
      httpContent += `  error: Error | null;\n`;
      httpContent += `}\n\n`;
    }

    httpContent += `/**\n`;
    httpContent += ` * Makes an HTTP request to the API\n`;
    httpContent += ` * @param method - HTTP method (GET, POST, etc.)\n`;
    httpContent += ` * @param url - Request URL\n`;
    httpContent += ` * @param options - Additional request options\n`;
    httpContent += ` * @returns Promise resolving to API response\n`;
    httpContent += ` */\n`;
    httpContent += `export async function makeRequest<T = any>(\n`;
    httpContent += `  method: string,\n`;
    httpContent += `  url: string,\n`;
    httpContent += `  options: any = {}\n`;
    httpContent += `)`;

    if (responseConfig.pattern !== "promise") {
      httpContent += `: Promise<ApiResponse<T>> {\n`;
      httpContent += `  // Replace URL parameters\n`;
      httpContent += `  let processedUrl = url;\n`;
      httpContent += `  if (options.params) {\n`;
      httpContent += `    for (const [key, value] of Object.entries(options.params)) {\n`;
      httpContent += `      processedUrl = processedUrl.replace(\`{\${key}}\`, String(value));\n`;
      httpContent += `    }\n`;
      httpContent += `  }\n\n`;
      httpContent += `  try {\n`;
      if (config.httpClient === "axios") {
        httpContent += `    const response = await httpClient.request({\n`;
        httpContent += `      method,\n`;
        httpContent += `      url: processedUrl,\n`;
        httpContent += `      ...options,\n`;
        httpContent += `    });\n`;
        httpContent += `    return { data: response.data, error: null };\n`;
      } else {
        httpContent += `    const response = await fetch(\`\${API_BASE_URL}\${processedUrl}\`, {\n`;
        httpContent += `      method,\n`;
        httpContent += `      ...options,\n`;
        httpContent += `    });\n`;
        httpContent += `    if (!response.ok) {\n`;
        httpContent += `      throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);\n`;
        httpContent += `    }\n`;
        httpContent += `    const data = await response.json();\n`;
        httpContent += `    return { data, error: null };\n`;
      }
      httpContent += `  } catch (error) {\n`;
      httpContent += `    return { data: null, error: error as Error };\n`;
      httpContent += `  }\n`;
    } else {
      httpContent += ` {\n`;
      httpContent += `  // Replace URL parameters\n`;
      httpContent += `  let processedUrl = url;\n`;
      httpContent += `  if (options.params) {\n`;
      httpContent += `    for (const [key, value] of Object.entries(options.params)) {\n`;
      httpContent += `      processedUrl = processedUrl.replace(\`{\${key}}\`, String(value));\n`;
      httpContent += `    }\n`;
      httpContent += `  }\n\n`;
      if (config.httpClient === "axios") {
        httpContent += `  const response = await httpClient.request({\n`;
        httpContent += `    method,\n`;
        httpContent += `    url: processedUrl,\n`;
        httpContent += `    ...options,\n`;
        httpContent += `  });\n`;
        httpContent += `  return response.data;\n`;
      } else {
        httpContent += `  const response = await fetch(\`\${API_BASE_URL}\${processedUrl}\`, {\n`;
        httpContent += `    method,\n`;
        httpContent += `    ...options,\n`;
        httpContent += `  });\n`;
        httpContent += `  if (!response.ok) {\n`;
        httpContent += `    throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);\n`;
        httpContent += `  }\n`;
        httpContent += `  return response.json();\n`;
      }
    }

    httpContent += "}\n";

    files["http.ts"] = httpContent;
  }

  // Error classes
  if (
    errorConfig.enabled !== false &&
    responseConfig.includeErrorClasses !== false
  ) {
    let errorContent = includeComments
      ? "// Custom error classes\n// This file defines custom error types for API error handling\n\n"
      : "";

    if (errorConfig.includeNetworkErrors !== false) {
      errorContent += `/**\n`;
      errorContent += ` * API Error - Base class for API-related errors\n`;
      errorContent += ` */\n`;
      errorContent += `export class ApiError extends Error {\n`;
      errorContent += `  /** HTTP status code */\n`;
      errorContent += `  statusCode?: number;\n`;
      errorContent += `  /** Response data */\n`;
      errorContent += `  response?: any;\n\n`;
      errorContent += `  constructor(\n`;
      errorContent += `    message: string,\n`;
      errorContent += `    statusCode?: number,\n`;
      errorContent += `    response?: any\n`;
      errorContent += `  ) {\n`;
      errorContent += `    super(message);\n`;
      errorContent += `    this.name = 'ApiError';\n`;
      errorContent += `    this.statusCode = statusCode;\n`;
      errorContent += `    this.response = response;\n`;
      errorContent += `  }\n`;
      errorContent += `}\n\n`;
    }

    if (errorConfig.includeValidationErrors !== false) {
      errorContent += `/**\n`;
      errorContent += ` * Validation Error - For input validation failures\n`;
      errorContent += ` */\n`;
      errorContent += `export class ValidationError extends Error {\n`;
      errorContent += `  /** Field that failed validation */\n`;
      errorContent += `  field?: string;\n`;
      errorContent += `  /** Invalid value */\n`;
      errorContent += `  value?: any;\n\n`;
      errorContent += `  constructor(\n`;
      errorContent += `    message: string,\n`;
      errorContent += `    field?: string,\n`;
      errorContent += `    value?: any\n`;
      errorContent += `  ) {\n`;
      errorContent += `    super(message);\n`;
      errorContent += `    this.name = 'ValidationError';\n`;
      errorContent += `    this.field = field;\n`;
      errorContent += `    this.value = value;\n`;
      errorContent += `  }\n`;
      errorContent += `}\n\n`;
    }

    if (errorConfig.includeNetworkErrors !== false) {
      errorContent += `/**\n`;
      errorContent += ` * Network Error - For network connectivity issues\n`;
      errorContent += ` */\n`;
      errorContent += `export class NetworkError extends Error {\n`;
      errorContent += `  constructor(message: string) {\n`;
      errorContent += `    super(message);\n`;
      errorContent += `    this.name = 'NetworkError';\n`;
      errorContent += `  }\n`;
      errorContent += `}\n\n`;
    }

    // Custom error classes
    if (errorConfig.customErrorClasses) {
      for (const customError of errorConfig.customErrorClasses) {
        errorContent += `/**\n`;
        errorContent += ` * ${customError.name} - Custom error class\n`;
        errorContent += ` */\n`;
        errorContent += `export class ${customError.name} extends ${
          customError.baseClass || "Error"
        } {\n`;
        if (customError.properties) {
          customError.properties.forEach((prop) => {
            errorContent += `  /** ${prop} property */\n`;
            errorContent += `  ${prop}: any;\n`;
          });
          errorContent += `\n`;
          errorContent += `  constructor(\n`;
          errorContent += `    message: string,\n`;
          customError.properties.forEach((prop) => {
            errorContent += `    ${prop}: any,\n`;
          });
          errorContent += `  ) {\n`;
          errorContent += `    super(message);\n`;
          errorContent += `    this.name = '${customError.name}';\n`;
          customError.properties.forEach((prop) => {
            errorContent += `    this.${prop} = ${prop};\n`;
          });
          errorContent += `  }\n`;
        } else {
          errorContent += `  constructor(message: string) {\n`;
          errorContent += `    super(message);\n`;
          errorContent += `    this.name = '${customError.name}';\n`;
          errorContent += `  }\n`;
        }
        errorContent += `}\n\n`;
      }
    }

    files["errors.ts"] = errorContent;
  }

  // Plugin system
  if (pluginsConfig.enabled !== false) {
    let pluginContent = includeComments
      ? "// Plugin system\n// This file provides a plugin architecture for extending API functionality\n\n"
      : "";

    pluginContent += `/**\n`;
    pluginContent += ` * Plugin interface for extending API functionality\n`;
    pluginContent += ` */\n`;
    pluginContent += `export interface Plugin {\n`;
    pluginContent += `  /** Plugin name */\n`;
    pluginContent += `  name: string;\n`;
    pluginContent += `  /** Called before making a request */\n`;
    pluginContent += `  beforeRequest?: (config: any) => any;\n`;
    pluginContent += `  /** Called after receiving a response */\n`;
    pluginContent += `  afterResponse?: (response: any) => any;\n`;
    pluginContent += `  /** Called when an error occurs */\n`;
    pluginContent += `  onError?: (error: any) => any;\n`;
    pluginContent += `}\n\n`;

    pluginContent += `/**\n`;
    pluginContent += ` * Registry for managing API plugins\n`;
    pluginContent += ` */\n`;
    pluginContent += `export class ${
      pluginsConfig.registryClassName || "PluginRegistry"
    } {\n`;
    pluginContent += `  private plugins: Plugin[] = [];\n\n`;
    pluginContent += `  /**\n`;
    pluginContent += `   * Register a plugin\n`;
    pluginContent += `   * @param plugin - The plugin to register\n`;
    pluginContent += `   */\n`;
    pluginContent += `  register(plugin: Plugin) {\n`;
    pluginContent += `    this.plugins.push(plugin);\n`;
    pluginContent += `  }\n\n`;
    pluginContent += `  /**\n`;
    pluginContent += `   * Apply beforeRequest hooks from all registered plugins\n`;
    pluginContent += `   * @param config - The request configuration\n`;
    pluginContent += `   * @returns Modified configuration\n`;
    pluginContent += `   */\n`;
    pluginContent += `  async applyBeforeRequest(config: any) {\n`;
    pluginContent += `    let result = config;\n`;
    pluginContent += `    for (const plugin of this.plugins) {\n`;
    pluginContent += `      if (plugin.beforeRequest) {\n`;
    pluginContent += `        result = await plugin.beforeRequest(result);\n`;
    pluginContent += `      }\n`;
    pluginContent += `    }\n`;
    pluginContent += `    return result;\n`;
    pluginContent += `  }\n\n`;
    pluginContent += `  /**\n`;
    pluginContent += `   * Apply afterResponse hooks from all registered plugins\n`;
    pluginContent += `   * @param response - The response object\n`;
    pluginContent += `   * @returns Modified response\n`;
    pluginContent += `   */\n`;
    pluginContent += `  async applyAfterResponse(response: any) {\n`;
    pluginContent += `    let result = response;\n`;
    pluginContent += `    for (const plugin of this.plugins) {\n`;
    pluginContent += `      if (plugin.afterResponse) {\n`;
    pluginContent += `        result = await plugin.afterResponse(result);\n`;
    pluginContent += `      }\n`;
    pluginContent += `    }\n`;
    pluginContent += `    return result;\n`;
    pluginContent += `  }\n\n`;
    pluginContent += `  /**\n`;
    pluginContent += `   * Apply onError hooks from all registered plugins\n`;
    pluginContent += `   * @param error - The error object\n`;
    pluginContent += `   * @returns Modified error\n`;
    pluginContent += `   */\n`;
    pluginContent += `  async applyOnError(error: any) {\n`;
    pluginContent += `    let result = error;\n`;
    pluginContent += `    for (const plugin of this.plugins) {\n`;
    pluginContent += `      if (plugin.onError) {\n`;
    pluginContent += `        result = await plugin.onError(result);\n`;
    pluginContent += `      }\n`;
    pluginContent += `    }\n`;
    pluginContent += `    return result;\n`;
    pluginContent += `  }\n`;
    pluginContent += `}\n`;

    files["plugins.ts"] = pluginContent;
  } // Main client class
  if (clientConfig.enabled !== false) {
    const className = clientConfig.className || "ReatchifyClient";
    let clientContent = includeComments
      ? "// Reatchify Client\n// Main client class for API interactions with plugin support\n\n"
      : "";

    clientContent += `import * as api from '../${
      config.folderStructure?.api || "api"
    }';\n`;
    if (responseConfig.pattern !== "promise") {
      clientContent += `import { ApiResponse } from './http';\n`;
    }
    if (pluginsConfig.enabled !== false) {
      clientContent += `import { PluginRegistry } from './plugins';\n`;
    }
    clientContent += `\n`;

    clientContent += `/**\n`;
    clientContent += ` * Configuration options for the ${className}\n`;
    clientContent += ` */\n`;
    clientContent += `export interface ${className}Config {\n`;
    clientContent += `  /** API key for authentication */\n`;
    clientContent += `  apiKey?: string;\n`;
    clientContent += `  /** Base URL for API requests */\n`;
    clientContent += `  baseUrl?: string;\n`;
    if (versioningConfig.enabled !== false) {
      clientContent += `  /** API version */\n`;
      clientContent += `  version?: string;\n`;
    }
    clientContent += `  /** Environment (dev, staging, prod) */\n`;
    clientContent += `  environment?: 'dev' | 'staging' | 'prod';\n`;
    if (pluginsConfig.enabled !== false) {
      clientContent += `  /** Plugins to extend functionality */\n`;
      clientContent += `  plugins?: any[];\n`;
    }
    clientContent += `}\n\n`;

    clientContent += `/**\n`;
    clientContent += ` * Main API client class with plugin support and configuration\n`;
    clientContent += ` */\n`;
    clientContent += `export class ${className} {\n`;
    clientContent += `  private config: ${className}Config;\n`;
    if (pluginsConfig.enabled !== false) {
      clientContent += `  private pluginRegistry: PluginRegistry;\n`;
    }
    clientContent += `\n`;

    clientContent += `  /**\n`;
    clientContent += `   * Create a new API client instance\n`;
    clientContent += `   * @param config - Client configuration options\n`;
    clientContent += `   */\n`;
    clientContent += `  constructor(config: ${className}Config = {}) {\n`;
    clientContent += `    this.config = {\n`;
    clientContent += `      baseUrl: process.env.REACTIFY_API_BASE_URL || '${INTERNAL_API_CONFIG.baseUrls.prod}',\n`;
    if (versioningConfig.enabled !== false) {
      clientContent += `      version: '${
        mergedConfig.apiVersion || INTERNAL_API_CONFIG.defaultVersion
      }',\n`;
    }
    clientContent += `      environment: 'prod',\n`;
    clientContent += `      ...config,\n`;
    clientContent += `    };\n`;
    if (pluginsConfig.enabled !== false) {
      clientContent += `    this.pluginRegistry = new PluginRegistry();\n`;
      clientContent += `\n`;
      clientContent += `    // Register plugins\n`;
      clientContent += `    if (config.plugins) {\n`;
      clientContent += `      config.plugins.forEach(plugin => this.pluginRegistry.register(plugin));\n`;
      clientContent += `    }\n`;
    }
    clientContent += `  }\n\n`;

    clientContent += `  /**\n`;
    clientContent += `   * Access to API operation methods\n`;
    clientContent += `   */\n`;
    clientContent += `  get api() {\n`;
    clientContent += `    return api;\n`;
    clientContent += `  }\n\n`;

    // Helper method for making requests with plugins
    if (pluginsConfig.enabled !== false) {
      clientContent += `  /**\n`;
      clientContent += `   * Make an HTTP request with plugin processing\n`;
      clientContent += `   * @param method - HTTP method\n`;
      clientContent += `   * @param url - Request URL\n`;
      clientContent += `   * @param options - Request options\n`;
      clientContent += `   * @returns Promise resolving to API response\n`;
      clientContent += `   */\n`;
      clientContent += `  async request<T = any>(\n`;
      clientContent += `    method: string,\n`;
      clientContent += `    url: string,\n`;
      clientContent += `    options: any = {}\n`;
      clientContent += `  )`;

      if (responseConfig.pattern !== "promise") {
        clientContent += `: Promise<ApiResponse<T>> {\n`;
        clientContent += `    // Apply before request plugins\n`;
        clientContent += `    const config = await this.pluginRegistry.applyBeforeRequest({\n`;
        clientContent += `      method,\n`;
        clientContent += `      url,\n`;
        clientContent += `      ...options,\n`;
        clientContent += `      headers: {\n`;
        clientContent += `        'Authorization': \`Bearer \${this.config.apiKey}\`,\n`;
        if (versioningConfig.enabled !== false) {
          clientContent += `        '${
            versioningConfig.headerName || "X-API-Version"
          }': this.config.version,\n`;
        }
        clientContent += `        ...options.headers,\n`;
        clientContent += `      },\n`;
        clientContent += `    });\n\n`;
        clientContent += `    try {\n`;
        clientContent += `      // Make the request\n`;
        clientContent += `      const response = await fetch(\`\${this.config.baseUrl}\${url}\`, config);\n`;
        clientContent += `      \n`;
        clientContent += `      if (!response.ok) {\n`;
        clientContent += `        throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);\n`;
        clientContent += `      }\n\n`;
        clientContent += `      const data = await response.json();\n`;
        clientContent += `      \n`;
        clientContent += `      // Apply after response plugins\n`;
        clientContent += `      const processedResponse = await this.pluginRegistry.applyAfterResponse({\n`;
        clientContent += `        data,\n`;
        clientContent += `        status: response.status,\n`;
        clientContent += `      });\n\n`;
        clientContent += `      return { data: processedResponse.data, error: null };\n`;
        clientContent += `    } catch (error) {\n`;
        clientContent += `      // Apply error plugins\n`;
        clientContent += `      const processedError = await this.pluginRegistry.applyOnError(error);\n`;
        clientContent += `      return { data: null, error: processedError };\n`;
        clientContent += `    }\n`;
      } else {
        clientContent += ` {\n`;
        clientContent += `    const config = await this.pluginRegistry.applyBeforeRequest({\n`;
        clientContent += `      method,\n`;
        clientContent += `      url,\n`;
        clientContent += `      ...options,\n`;
        clientContent += `      headers: {\n`;
        clientContent += `        'Authorization': \`Bearer \${this.config.apiKey}\`,\n`;
        if (versioningConfig.enabled !== false) {
          clientContent += `        '${
            versioningConfig.headerName || "X-API-Version"
          }': this.config.version,\n`;
        }
        clientContent += `        ...options.headers,\n`;
        clientContent += `      },\n`;
        clientContent += `    });\n\n`;
        clientContent += `    const response = await fetch(\`\${this.config.baseUrl}\${url}\`, config);\n`;
        clientContent += `    if (!response.ok) {\n`;
        clientContent += `      throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);\n`;
        clientContent += `    }\n`;
        clientContent += `    return response.json();\n`;
      }

      clientContent += `  }\n`;
    }

    clientContent += `}\n`;

    files["index.ts"] = clientContent;
  }

  // Config loader
  let configContent = includeComments ? "// Configuration loader\n\n" : "";
  configContent += `import fs from 'fs';\n`;
  configContent += `import path from 'path';\n\n`;

  configContent += `export interface UserConfig {\n`;
  configContent += `  apiKey?: string;\n`;
  configContent += `  baseUrl?: string;\n`;
  if (versioningConfig.enabled !== false) {
    configContent += `  version?: string;\n`;
  }
  configContent += `  environment?: 'dev' | 'staging' | 'prod';\n`;
  configContent += `  httpClient?: 'axios' | 'fetch';\n`;
  if (pluginsConfig.enabled !== false) {
    configContent += `  plugins?: any[];\n`;
  }
  configContent += `}\n\n`;

  configContent += `export function loadConfig(): UserConfig {\n`;
  configContent += `  const configPath = path.resolve(process.cwd(), 'reatchify.config.ts');\n`;
  configContent += `  \n`;
  configContent += `  if (fs.existsSync(configPath)) {\n`;
  configContent += `    // In a real implementation, this would use a bundler to load the TS config\n`;
  configContent += `    // For now, return defaults\n`;
  configContent += `    return {};\n`;
  configContent += `  }\n\n`;
  configContent += `  return {};\n`;
  configContent += `}\n`;

  files["config.ts"] = configContent;

  // Utils
  if (clientConfig.includeUtils !== false) {
    let utilsContent = includeComments ? "// Utility functions\n\n" : "";

    utilsContent += `export function buildQueryString(params: Record<string, any>): string {\n`;
    utilsContent += `  const query = new URLSearchParams();\n`;
    utilsContent += `  for (const [key, value] of Object.entries(params)) {\n`;
    utilsContent += `    if (value !== undefined && value !== null) {\n`;
    utilsContent += `      query.append(key, String(value));\n`;
    utilsContent += `    }\n`;
    utilsContent += `  }\n`;
    utilsContent += `  return query.toString();\n`;
    utilsContent += `}\n\n`;

    utilsContent += `export function buildHeaders(headers: Record<string, string>): Record<string, string> {\n`;
    utilsContent += `  return {\n`;
    utilsContent += `    'Content-Type': 'application/json',\n`;
    utilsContent += `    ...headers,\n`;
    utilsContent += `  };\n`;
    utilsContent += `}\n\n`;

    utilsContent += `export function serializeParams(params: Record<string, any>): Record<string, any> {\n`;
    utilsContent += `  const result: Record<string, any> = {};\n`;
    utilsContent += `  for (const [key, value] of Object.entries(params)) {\n`;
    utilsContent += `    if (typeof value === 'object' && value !== null) {\n`;
    utilsContent += `      result[key] = JSON.stringify(value);\n`;
    utilsContent += `    } else {\n`;
    utilsContent += `      result[key] = value;\n`;
    utilsContent += `    }\n`;
    utilsContent += `  }\n`;
    utilsContent += `  return result;\n`;
    utilsContent += `}\n`;

    files["utils.ts"] = utilsContent;
  }

  return files;
}

function generateMainIndexFile(config: ReatchifyConfig): string {
  const clientConfig = config.client || {};
  const folderConfig = config.folderStructure || {};
  const includeComments = config.generation?.includeComments !== false;

  let index = includeComments ? "// Reatchify SDK - Main Entry Point\n\n" : "";

  // Export client class
  if (clientConfig.enabled !== false) {
    const className = clientConfig.className || "ReatchifyClient";
    if (clientConfig.exportAsDefault) {
      index += `export { default } from './${
        folderConfig.client || "client"
      }';\n`;
    } else {
      index += `export { ${className} } from './${
        folderConfig.client || "client"
      }';\n`;
    }
  }

  // Export types
  if (config.generation?.includeComments !== false) {
    index += `export * from './${folderConfig.types || "types"}';\n`;
  }

  // Export API
  if (config.api?.enabled !== false) {
    index += `export * from './${folderConfig.api || "api"}';\n`;
  }

  // Export stores
  if (config.stateManagement !== "none") {
    index += `export * from './${folderConfig.stores || "stores"}';\n`;
  }

  return index;
}
