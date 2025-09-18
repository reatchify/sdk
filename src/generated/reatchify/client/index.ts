// Reatchify Client
// Main client class for API interactions with plugin support

import * as api from '../api';
import { ApiResponse } from './http';
import { PluginRegistry } from './plugins';

/**
 * Configuration options for the ReatchifyClient
 */
export interface ReatchifyClientConfig {
  /** API key for authentication */
  apiKey?: string;
  /** Base URL for API requests */
  baseUrl?: string;
  /** API version */
  version?: string;
  /** Environment (dev, staging, prod) */
  environment?: 'dev' | 'staging' | 'prod';
  /** Plugins to extend functionality */
  plugins?: any[];
}

/**
 * Main API client class with plugin support and configuration
 */
export class ReatchifyClient {
  private config: ReatchifyClientConfig;
  private pluginRegistry: PluginRegistry;

  /**
   * Create a new API client instance
   * @param config - Client configuration options
   */
  constructor(config: ReatchifyClientConfig = {}) {
    this.config = {
      baseUrl: process.env.REACTIFY_API_BASE_URL || 'https://api.internal-company.com',
      version: 'v2',
      environment: 'prod',
      ...config,
    };
    this.pluginRegistry = new PluginRegistry();

    // Register plugins
    if (config.plugins) {
      config.plugins.forEach(plugin => this.pluginRegistry.register(plugin));
    }
  }

  /**
   * Access to API operation methods
   */
  get api() {
    return api;
  }

  /**
   * Make an HTTP request with plugin processing
   * @param method - HTTP method
   * @param url - Request URL
   * @param options - Request options
   * @returns Promise resolving to API response
   */
  async request<T = any>(
    method: string,
    url: string,
    options: any = {}
  ): Promise<ApiResponse<T>> {
    // Apply before request plugins
    const config = await this.pluginRegistry.applyBeforeRequest({
      method,
      url,
      ...options,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'X-API-Version': this.config.version,
        ...options.headers,
      },
    });

    try {
      // Make the request
      const response = await fetch(`${this.config.baseUrl}${url}`, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Apply after response plugins
      const processedResponse = await this.pluginRegistry.applyAfterResponse({
        data,
        status: response.status,
      });

      return { data: processedResponse.data, error: null };
    } catch (error) {
      // Apply error plugins
      const processedError = await this.pluginRegistry.applyOnError(error);
      return { data: null, error: processedError };
    }
  }
}
