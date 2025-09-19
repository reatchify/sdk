/**
 * @fileoverview Store file generation utilities for Reatchify SDK
 * @description This module handles the generation of state management stores (Zustand, Redux) for API data
 * @author Reatchify Team
 * @version 1.0.0
 */

import { ApiSchema } from "../../schema/schema";
import { ReatchifyConfig } from "../../config/config";
import { generateMethodName, generateParams } from "../api";

/**
 * Generates state management store files
 * Creates Zustand stores or Redux slices for managing API state
 *
 * @param schema - The API schema containing endpoint definitions
 * @param config - The Reatchify configuration object
 * @returns A record of filename to content mappings for store files
 *
 * @example
 * ```typescript
 * const storeFiles = generateStoreFiles(schema, config);
 * // Returns: { 'apiStore.ts': '...', 'getUsersStore.ts': '...', 'index.ts': '...' }
 * ```
 */
export function generateStoreFiles(
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
    files["index.ts"] = generateZustandIndex(schema, includeComments);

    // Export individual endpoint stores
    for (const endpoint of schema.endpoints) {
      const methodName = generateMethodName(endpoint);
      const storeName =
        methodName.charAt(0).toUpperCase() + methodName.slice(1);
      files["index.ts"] += `export * from './${storeName}Store';\n`;
    }

    files["apiStore.ts"] = generateZustandApiStore(
      config,
      includeComments,
      naming
    );

    // Generate individual stores for each endpoint
    for (const endpoint of schema.endpoints) {
      const methodName = generateMethodName(endpoint);
      const storeName =
        methodName.charAt(0).toUpperCase() + methodName.slice(1);
      files[`${storeName}Store.ts`] = generateZustandEndpointStore(
        endpoint,
        config,
        includeComments,
        naming,
        methodName,
        storeName
      );
    }
  } else if (config.stateManagement === "redux") {
    files["index.ts"] = generateReduxIndex(includeComments);
    files["store.ts"] = generateReduxStore(includeComments);
    files["apiSlice.ts"] = generateReduxApiSlice(includeComments);
  }

  return files;
}

/**
 * Generates Zustand index file
 */
function generateZustandIndex(
  schema: ApiSchema,
  includeComments: boolean
): string {
  let index = includeComments
    ? "// Zustand stores\n// This file exports all generated Zustand stores\n\n"
    : "";
  index += `export * from './apiStore';\n`;

  return index;
}

/**
 * Generates Redux index file
 */
function generateReduxIndex(includeComments: boolean): string {
  let index = includeComments
    ? "// Redux stores\n// This file exports all generated Redux stores\n\n"
    : "";
  index += `export * from './store';\n`;
  index += `export * from './apiSlice';\n`;

  return index;
}

/**
 * Generates Zustand API store
 */
function generateZustandApiStore(
  config: ReatchifyConfig,
  includeComments: boolean,
  naming: any
): string {
  let content = includeComments
    ? "// Generated Zustand API store\n// This file provides global API state management\n\n"
    : "";

  content += `import { create } from 'zustand';\n\n`;

  content += `/**\n`;
  content += ` * Global API state interface\n`;
  content += ` */\n`;
  content += `interface ApiState {\n`;
  content += `  /** Loading state */\n`;
  content += `  loading: boolean;\n`;
  content += `  /** Error message */\n`;
  content += `  error: string | null;\n`;
  content += `  /** Set loading state */\n`;
  content += `  setLoading: (loading: boolean) => void;\n`;
  content += `  /** Set error message */\n`;
  content += `  setError: (error: string | null) => void;\n`;
  content += `}\n\n`;

  content += `/**\n`;
  content += ` * Global API store for managing loading states and errors\n`;
  content += ` */\n`;
  content += `export const ${naming.storePrefix}ApiStore = create<ApiState>((set) => ({\n`;
  content += `  loading: false,\n`;
  content += `  error: null,\n`;
  content += `  setLoading: (loading) => set({ loading }),\n`;
  content += `  setError: (error) => set({ error }),\n`;
  content += `}));\n`;

  return content;
}

/**
 * Generates individual Zustand endpoint store
 */
function generateZustandEndpointStore(
  endpoint: any,
  config: ReatchifyConfig,
  includeComments: boolean,
  naming: any,
  methodName: string,
  storeName: string
): string {
  const resource = endpoint.path.split("/")[1] || "general";
  const functionName = methodName;

  let content = includeComments
    ? `// Generated store for ${endpoint.path}\n// This file provides state management for ${endpoint.path} operations\n\n`
    : "";

  content += `import { create } from 'zustand';\n`;
  content += `import { ${functionName} } from '../api/${resource}';\n\n`;

  content += `/**\n`;
  content += ` * State interface for ${storeName} store\n`;
  content += ` */\n`;
  content += `interface ${storeName}State {\n`;
  content += `  /** Stored data */\n`;
  content += `  data: any;\n`;
  content += `  /** Loading state */\n`;
  content += `  loading: boolean;\n`;
  content += `  /** Error message */\n`;
  content += `  error: string | null;\n`;
  content += `  /** Fetch function */\n`;
  content += `  fetch: (${generateParams(
    endpoint.parameters || []
  )}) => Promise<void>;\n`;
  content += `}\n\n`;

  content += `/**\n`;
  content += ` * ${storeName} store for managing ${endpoint.path} data\n`;
  content += ` */\n`;
  content += `export const ${naming.storePrefix}${storeName}Store = create<${storeName}State>((set) => ({\n`;
  content += `  data: null,\n`;
  content += `  loading: false,\n`;
  content += `  error: null,\n`;
  content += `  fetch: async (${generateParams(
    endpoint.parameters || []
  )}) => {\n`;
  content += `    set({ loading: true, error: null });\n`;
  content += `    try {\n`;
  content += `      const data = await ${functionName}(${
    endpoint.parameters
      ? `{ ${endpoint.parameters.map((p: any) => p.name).join(", ")} }`
      : ""
  });\n`;
  content += `      set({ data, loading: false });\n`;
  content += `    } catch (error) {\n`;
  content += `      set({ error: (error as Error).message, loading: false });\n`;
  content += `    }\n`;
  content += `  },\n`;
  content += `}));\n`;

  return content;
}

/**
 * Generates Redux store configuration
 */
function generateReduxStore(includeComments: boolean): string {
  let content = includeComments
    ? "// Generated Redux store\n// This file configures the Redux store with API middleware\n\n"
    : "";

  content += `import { configureStore } from '@reduxjs/toolkit';\n`;
  content += `import { apiSlice } from './apiSlice';\n\n`;

  content += `/**\n`;
  content += ` * Configured Redux store with API slice\n`;
  content += ` */\n`;
  content += `export const store = configureStore({\n`;
  content += `  reducer: {\n`;
  content += `    [apiSlice.reducerPath]: apiSlice.reducer,\n`;
  content += `  },\n`;
  content += `  middleware: (getDefaultMiddleware) =>\n`;
  content += `    getDefaultMiddleware().concat(apiSlice.middleware),\n`;
  content += `});\n\n`;

  content += `/**\n`;
  content += ` * Type definitions for Redux store\n`;
  content += ` */\n`;
  content += `export type RootState = ReturnType<typeof store.getState>;\n`;
  content += `export type AppDispatch = typeof store.dispatch;\n`;

  return content;
}

/**
 * Generates Redux API slice
 */
function generateReduxApiSlice(includeComments: boolean): string {
  let content = includeComments
    ? "// Generated Redux API slice\n// This file provides RTK Query API slice for data fetching\n\n"
    : "";

  content += `import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';\n\n`;

  content += `const API_BASE_URL = process.env.REACTIFY_API_BASE_URL || '';\n\n`;

  content += `/**\n`;
  content += ` * RTK Query API slice for handling API requests\n`;
  content += ` */\n`;
  content += `export const apiSlice = createApi({\n`;
  content += `  reducerPath: 'api',\n`;
  content += `  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),\n`;
  content += `  endpoints: (builder) => ({\n`;
  content += `    // TODO: Add endpoints based on schema\n`;
  content += `  }),\n`;
  content += `});\n`;

  return content;
}
