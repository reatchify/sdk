// Copilot: Config loader and defineConfig helper for reatchify.config.ts

// Internal API configuration - kept private
export const INTERNAL_API_CONFIG = {
  baseUrls: {
    dev: "https://api-dev.internal-company.com",
    staging: "https://api-staging.internal-company.com",
    prod: "https://api.internal-company.com",
  },
  defaultVersion: "v2",
  supportedVersions: ["v1", "v2", "v3"],
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    "X-Client": "reatchify-sdk",
  },
} as const;

export interface ReatchifyConfig {
  // Basic configuration
  apiKey?: string;
  language?: "js" | "ts" | "auto";
  stateManagement?: "zustand" | "redux" | "none";
  httpClient?: "axios" | "fetch" | string;
  outputDir?: string;
  environments?: Record<string, Partial<ReatchifyConfig>>;
  projectType?:
    | "next"
    | "qwik"
    | "react"
    | "vite"
    | "vue"
    | "svelte"
    | "angular"
    | "vanilla"
    | "auto";
  naming?: {
    clientPrefix?: string;
    storePrefix?: string;
    hookPrefix?: string;
  };

  // Authentication configuration
  auth?: {
    enabled?: boolean; // default: true - whether to generate authentication code
  };

  // Service selection configuration
  services?: {
    include?: string[]; // default: all services from schema - which services to generate
  };

  // API Version configuration (user can choose version)
  apiVersion?: string; // default: INTERNAL_API_CONFIG.defaultVersion

  // Folder structure configuration
  folderStructure?: {
    types?: string; // default: "types"
    api?: string; // default: "api"
    client?: string; // default: "client"
    stores?: string; // default: "stores"
  };

  // Client class configuration
  client?: {
    enabled?: boolean; // default: true
    className?: string; // default: "ReatchifyClient"
    exportAsDefault?: boolean; // default: false
    includeUtils?: boolean; // default: true
  };

  // API namespace configuration
  api?: {
    enabled?: boolean; // default: true
    namespaceName?: string; // default: "api"
    groupByResource?: boolean; // default: true
    includeHttpClient?: boolean; // default: true
  };

  // Response pattern configuration
  response?: {
    pattern?: "promise" | "result"; // default: "result" ({data, error})
    includeErrorClasses?: boolean; // default: true
    customErrorTypes?: string[]; // additional error types to generate
  };

  // Plugin system configuration
  plugins?: {
    enabled?: boolean; // default: true
    registryClassName?: string; // default: "PluginRegistry"
    includeDefaultPlugins?: boolean; // default: false
  };

  // Versioning configuration (internal API versioning)
  versioning?: {
    enabled?: boolean; // default: true
    headerName?: string; // default: "X-API-Version"
    versionFromPackage?: boolean; // default: false
  };

  // Error handling configuration
  errorHandling?: {
    enabled?: boolean; // default: true
    includeNetworkErrors?: boolean; // default: true
    includeValidationErrors?: boolean; // default: true
    customErrorClasses?: Array<{
      name: string;
      baseClass?: string;
      properties?: string[];
    }>;
  };

  // HTTP client configuration (internal API settings are managed internally)
  http?: {
    timeout?: number; // will use internal default if not specified
    headers?: Record<string, string>; // merged with internal headers
    retry?: {
      enabled?: boolean;
      maxAttempts?: number;
      delay?: number;
    };
    interceptors?: {
      request?: boolean;
      response?: boolean;
    };
  };

  // Code generation options
  generation?: {
    includeComments?: boolean; // default: true
    includeJSDoc?: boolean; // default: true
    minify?: boolean; // default: false
    sourceMap?: boolean; // default: false
    declarationFiles?: boolean; // default: true
    overwrite?: boolean; // default: false - whether to overwrite existing files
    dryRun?: boolean; // default: false - simulate generation without writing files
    validateOutput?: boolean; // default: false - run TypeScript check on generated code
  };

  // Advanced options
  advanced?: {
    customTemplates?: Record<string, string>;
    transformers?: Array<{
      name: string;
      transform: (code: string) => string;
    }>;
    hooks?: {
      beforeGenerate?: () => void;
      afterGenerate?: () => void;
      onError?: (error: Error) => void;
    };
  };
}

export function defineConfig(config: ReatchifyConfig): ReatchifyConfig {
  return config;
}

// TODO: Add config file loader logic
