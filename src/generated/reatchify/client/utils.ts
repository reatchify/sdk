// Utility functions

export function buildQueryString(params: Record<string, any>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      query.append(key, String(value));
    }
  }
  return query.toString();
}

export function buildHeaders(headers: Record<string, string>): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    ...headers,
  };
}

export function serializeParams(params: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'object' && value !== null) {
      result[key] = JSON.stringify(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}
