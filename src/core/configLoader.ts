// Copilot: Loads and validates reatchify.config.ts, supports environments and defaults

import * as path from "path";
import * as fs from "fs";
import { ReatchifyConfig } from "./config";

const DEFAULTS: ReatchifyConfig = {
  language: "auto",
  stateManagement: "zustand",
  httpClient: "axios",
  outputDir: "./src/generated/reatchify",
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
