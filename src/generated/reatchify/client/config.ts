// Configuration loader

import fs from 'fs';
import path from 'path';

export interface UserConfig {
  apiKey?: string;
  baseUrl?: string;
  version?: string;
  environment?: 'dev' | 'staging' | 'prod';
  httpClient?: 'axios' | 'fetch';
  plugins?: any[];
}

export function loadConfig(): UserConfig {
  const configPath = path.resolve(process.cwd(), 'reatchify.config.ts');
  
  if (fs.existsSync(configPath)) {
    // In a real implementation, this would use a bundler to load the TS config
    // For now, return defaults
    return {};
  }

  return {};
}
