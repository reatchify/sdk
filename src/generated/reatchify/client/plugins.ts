// Plugin system
// This file provides a plugin architecture for extending API functionality

/**
 * Plugin interface for extending API functionality
 */
export interface Plugin {
  /** Plugin name */
  name: string;
  /** Called before making a request */
  beforeRequest?: (config: any) => any;
  /** Called after receiving a response */
  afterResponse?: (response: any) => any;
  /** Called when an error occurs */
  onError?: (error: any) => any;
}

/**
 * Registry for managing API plugins
 */
export class PluginRegistry {
  private plugins: Plugin[] = [];

  /**
   * Register a plugin
   * @param plugin - The plugin to register
   */
  register(plugin: Plugin) {
    this.plugins.push(plugin);
  }

  /**
   * Apply beforeRequest hooks from all registered plugins
   * @param config - The request configuration
   * @returns Modified configuration
   */
  async applyBeforeRequest(config: any) {
    let result = config;
    for (const plugin of this.plugins) {
      if (plugin.beforeRequest) {
        result = await plugin.beforeRequest(result);
      }
    }
    return result;
  }

  /**
   * Apply afterResponse hooks from all registered plugins
   * @param response - The response object
   * @returns Modified response
   */
  async applyAfterResponse(response: any) {
    let result = response;
    for (const plugin of this.plugins) {
      if (plugin.afterResponse) {
        result = await plugin.afterResponse(result);
      }
    }
    return result;
  }

  /**
   * Apply onError hooks from all registered plugins
   * @param error - The error object
   * @returns Modified error
   */
  async applyOnError(error: any) {
    let result = error;
    for (const plugin of this.plugins) {
      if (plugin.onError) {
        result = await plugin.onError(result);
      }
    }
    return result;
  }
}
