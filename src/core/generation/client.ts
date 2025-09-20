/**
 * @fileoverview Client file generation utilities for Reatchify SDK
 * @description This module handles the generation of client-side files including HTTP clients, error handling, plugins, and main client classes
 * @author Reatchify Team
 * @version 1.0.0
 */

import { ApiSchema } from "../schema/schema";
import { ReatchifyConfig, INTERNAL_API_CONFIG } from "../config/config";

/**
 * Generates client-side files for the SDK
 * Creates HTTP client wrappers, error classes, plugin system, and main client class
 *
 * @param schema - The API schema containing endpoint definitions
 * @param config - The Reatchify configuration object
 * @param mergedConfig - The merged configuration with defaults applied
 * @returns A record of filename to content mappings for client files
 *
 * @example
 * ```typescript
 * const clientFiles = generateClientFiles(schema, config, mergedConfig);
 * // Returns: { 'http.ts': '...', 'errors.ts': '...', 'plugins.ts': '...', 'index.ts': '...' }
 * ```
 */
export function generateClientFiles(
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
  const authConfig = config.auth || {};
  const includeComments = config.generation?.includeComments !== false;

  // HTTP client wrapper
  if (config.api?.includeHttpClient !== false) {
    files["http.ts"] = generateHttpClient(
      config,
      includeComments,
      responseConfig,
      httpConfig
    );
  }

  // Error classes
  if (
    errorConfig.enabled !== false &&
    responseConfig.includeErrorClasses !== false
  ) {
    files["errors.ts"] = generateErrorClasses(
      config,
      includeComments,
      errorConfig
    );
  }

  // Plugin system
  if (pluginsConfig.enabled !== false) {
    files["plugins.ts"] = generatePluginSystem(
      config,
      includeComments,
      pluginsConfig
    );
  }

  // Main client class
  if (clientConfig.enabled !== false) {
    files["index.ts"] = generateMainClientClass(
      schema,
      config,
      mergedConfig,
      includeComments,
      clientConfig,
      responseConfig,
      pluginsConfig,
      versioningConfig,
      authConfig
    );
  }

  // Config loader
  files["config.ts"] = generateConfigLoader(
    config,
    includeComments,
    versioningConfig,
    pluginsConfig
  );

  // Utils
  if (clientConfig.includeUtils !== false) {
    files["utils.ts"] = generateClientUtils(includeComments);
  }

  return files;
}

/**
 * Generates HTTP client wrapper code
 */
function generateHttpClient(
  config: ReatchifyConfig,
  includeComments: boolean,
  responseConfig: any,
  httpConfig: any
): string {
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

  return httpContent;
}

/**
 * Generates error class definitions
 */
function generateErrorClasses(
  config: ReatchifyConfig,
  includeComments: boolean,
  errorConfig: any
): string {
  let errorContent = includeComments
    ? "// Custom error classes\n// This file defines custom error types for API error handling\n\n"
    : "";

  // Network errors
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

  // Validation errors
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

  // Network connectivity errors
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
        customError.properties.forEach((prop: string) => {
          errorContent += `  /** ${prop} property */\n`;
          errorContent += `  ${prop}: any;\n`;
        });
        errorContent += `\n`;
        errorContent += `  constructor(\n`;
        errorContent += `    message: string,\n`;
        customError.properties.forEach((prop: string) => {
          errorContent += `    ${prop}: any,\n`;
        });
        errorContent += `  ) {\n`;
        errorContent += `    super(message);\n`;
        errorContent += `    this.name = '${customError.name}';\n`;
        customError.properties.forEach((prop: string) => {
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

  return errorContent;
}

/**
 * Generates plugin system code
 */
function generatePluginSystem(
  config: ReatchifyConfig,
  includeComments: boolean,
  pluginsConfig: any
): string {
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

  return pluginContent;
}

/**
 * Generates the main client class
 */
function generateMainClientClass(
  schema: ApiSchema,
  config: ReatchifyConfig,
  mergedConfig: ReatchifyConfig,
  includeComments: boolean,
  clientConfig: any,
  responseConfig: any,
  pluginsConfig: any,
  versioningConfig: any,
  authConfig: any
): string {
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
      if (authConfig.enabled !== false) {
        clientContent += `        'Authorization': \`Bearer \${this.config.apiKey}\`,\n`;
      }
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
      if (authConfig.enabled !== false) {
        clientContent += `        'Authorization': \`Bearer \${this.config.apiKey}\`,\n`;
      }
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

  return clientContent;
}

/**
 * Generates configuration loader code
 */
function generateConfigLoader(
  config: ReatchifyConfig,
  includeComments: boolean,
  versioningConfig: any,
  pluginsConfig: any
): string {
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

  return configContent;
}

/**
 * Generates client utility functions
 */
function generateClientUtils(includeComments: boolean): string {
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

  return utilsContent;
}
