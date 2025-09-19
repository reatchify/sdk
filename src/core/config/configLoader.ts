// Copilot: Loads and validates reatchify.config.ts, supports environments and defaults

import * as path from "path";
import * as fs from "fs";
import { ReatchifyConfig } from "./config";

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

const DEFAULTS: ReatchifyConfig = {
  language: "auto",
  stateManagement: "zustand",
  httpClient: "axios",
  outputDir: getDefaultOutputDir(),
  naming: {
    clientPrefix: "",
    storePrefix: "use",
    hookPrefix: "use",
  },
};

export async function loadConfig(
  env: string = "default"
): Promise<ReatchifyConfig> {
  const configPath = path.resolve(process.cwd(), "reatchify.config.json");
  if (!fs.existsSync(configPath)) {
    throw new Error(
      "reatchify.config.json not found. Run `reatchify init` first."
    );
  }
  const configRaw = fs.readFileSync(configPath, "utf-8");
  let config: ReatchifyConfig = JSON.parse(configRaw);
  if (config.environments && env !== "default") {
    config = { ...config, ...config.environments[env] };
  }
  return { ...DEFAULTS, ...config };
}
