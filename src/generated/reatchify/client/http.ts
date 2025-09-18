// HTTP client wrapper
// This file provides HTTP request functionality with configurable response patterns

import axios from 'axios';

const API_BASE_URL = process.env.REACTIFY_API_BASE_URL || 'https://api.internal-company.com';

const httpClient = axios.create({
  baseURL: API_BASE_URL,
});

/**
 * API Response interface for result pattern
 * @template T - The type of the response data
 */
export interface ApiResponse<T = any> {
  data: T | null;
  error: Error | null;
}

/**
 * Makes an HTTP request to the API
 * @param method - HTTP method (GET, POST, etc.)
 * @param url - Request URL
 * @param options - Additional request options
 * @returns Promise resolving to API response
 */
export async function makeRequest<T = any>(
  method: string,
  url: string,
  options: any = {}
): Promise<ApiResponse<T>> {
  // Replace URL parameters
  let processedUrl = url;
  if (options.params) {
    for (const [key, value] of Object.entries(options.params)) {
      processedUrl = processedUrl.replace(`{${key}}`, String(value));
    }
  }

  try {
    const response = await httpClient.request({
      method,
      url: processedUrl,
      ...options,
    });
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}
