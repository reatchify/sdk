// Copilot: Code generation utilities for Reatchify SDK

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import { ReatchifyConfig } from "../config/config";
import { mergeConfigWithDefaults } from "../config/configUtils";
import { fetchSchema } from "../schema/schema";
import { generateTypesFiles } from "./types";
import { generateApiFiles } from "./api";
import { generateClientFiles } from "./client";
import { generateStoreFiles } from "./stores";
import { generateMainIndexFile } from "./utils";

/**
 * Gets the default output directory with fallback logic
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

export async function generateCode(config: ReatchifyConfig): Promise<void> {
  let outputDir = "";

  try {
    // Run beforeGenerate hook if available
    if (config?.advanced?.hooks?.beforeGenerate) {
      config.advanced.hooks.beforeGenerate();
    }

    // Early validation
    if (!config) {
      throw new Error("Configuration is required for code generation.");
    }

    if (!config.apiKey) {
      throw new Error(
        "API key is required. Please set it in your config or environment variable."
      );
    }

    // Merge user config with internal defaults
    const mergedConfig = mergeConfigWithDefaults(config);
    const schema = await fetchSchema(mergedConfig);

    // Validate schema
    if (!schema || !schema.endpoints || schema.endpoints.length === 0) {
      throw new Error(
        "Invalid schema: No endpoints found. Please check your API configuration."
      );
    }

    // Apply project type-specific optimizations
    const optimizedConfig = mergedConfig;

    outputDir = path.resolve(
      process.cwd(),
      config.outputDir || getDefaultOutputDir()
    );

    const dryRun = config.generation?.dryRun === true;

    // Check for existing files if overwrite is not enabled
    const overwrite = config.generation?.overwrite !== false; // default true for safety
    if (!dryRun && !overwrite && fs.existsSync(outputDir)) {
      const files = fs.readdirSync(outputDir);
      if (files.length > 0) {
        throw new Error(
          `Output directory ${outputDir} is not empty. Set generation.overwrite to true to overwrite existing files, or choose a different output directory.`
        );
      }
    }

    // Check if output directory is writable
    if (!dryRun) {
      try {
        fs.accessSync(path.dirname(outputDir), fs.constants.W_OK);
      } catch {
        throw new Error(
          `Output directory ${outputDir} is not writable. Please check permissions.`
        );
      }

      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Install dependencies
    await installDependencies(optimizedConfig);

    // Get folder structure (use defaults)
    const typesDirName = "types";
    const apiDirName = "api";
    const clientDirName = "client";
    const storesDirName = "stores";

    // Create folder structure
    const typesDir = path.join(outputDir, typesDirName);
    const apiDir = path.join(outputDir, apiDirName);
    const clientDir = path.join(outputDir, clientDirName);

    if (!dryRun) {
      fs.mkdirSync(typesDir, { recursive: true });
      fs.mkdirSync(apiDir, { recursive: true });
      fs.mkdirSync(clientDir, { recursive: true });
    }

    // Generate types if enabled
    if (config.generation?.includeComments !== false) {
      const typesFiles = generateTypesFiles(schema, config);
      if (!dryRun) {
        for (const [filename, content] of Object.entries(typesFiles)) {
          fs.writeFileSync(path.join(typesDir, filename), content);
        }
      }
    }

    // Generate API operations if enabled
    if (config.api?.enabled !== false) {
      const apiFiles = generateApiFiles(schema, config);
      if (!dryRun) {
        for (const [filename, content] of Object.entries(apiFiles)) {
          fs.writeFileSync(path.join(apiDir, filename), content);
        }
      }
    }

    // Generate client core if enabled
    if (config.client?.enabled !== false) {
      const clientFiles = generateClientFiles(schema, config, mergedConfig);
      if (!dryRun) {
        for (const [filename, content] of Object.entries(clientFiles)) {
          fs.writeFileSync(path.join(clientDir, filename), content);
        }
      }
    }

    // Generate stores if state management is enabled
    if (config.stateManagement !== "none") {
      const storesDir = path.join(outputDir, storesDirName);
      if (!dryRun) {
        fs.mkdirSync(storesDir, { recursive: true });
      }

      const storeFiles = generateStoreFiles(schema, config);
      if (!dryRun) {
        for (const [filename, content] of Object.entries(storeFiles)) {
          fs.writeFileSync(path.join(storesDir, filename), content);
        }
      }
    }

    // Generate main index file
    const indexCode = generateMainIndexFile(config);
    if (!dryRun) {
      fs.writeFileSync(path.join(outputDir, "index.ts"), indexCode);
    }

    // Run TypeScript validation if enabled
    if (config.generation?.validateOutput && !dryRun) {
      try {
        execSync(`npx tsc --noEmit --skipLibCheck`, {
          cwd: outputDir,
          stdio: "inherit",
        });
      } catch (error) {
        // Don't throw here, just warn in CLI
      }
    }

    // Run post-generation hooks
    if (config.advanced?.hooks?.afterGenerate) {
      config.advanced.hooks.afterGenerate();
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Cleanup partially generated files on failure
    try {
      if (fs.existsSync(outputDir)) {
        fs.rmSync(outputDir, { recursive: true, force: true });
      }
    } catch (cleanupError) {
      // Ignore cleanup errors
    }

    // Run error hook if available
    if (config?.advanced?.hooks?.onError) {
      config.advanced.hooks.onError(
        error instanceof Error ? error : new Error(errorMessage)
      );
    }

    throw error;
  }
}

async function installDependencies(config: ReatchifyConfig): Promise<void> {
  const dependencies = [];

  // HTTP client dependencies
  if (config.httpClient === "axios") {
    dependencies.push("axios");
  }

  // State management dependencies
  if (config.stateManagement === "zustand") {
    dependencies.push("zustand");
  } else if (config.stateManagement === "redux") {
    dependencies.push("redux", "react-redux", "@reduxjs/toolkit");
  }

  // Additional dependencies based on config
  if (config.http?.retry?.enabled) {
    dependencies.push("axios-retry"); // for axios retry functionality
  }

  if (config.plugins?.includeDefaultPlugins) {
    // Add any default plugin dependencies
  }

  if (dependencies.length > 0) {
    console.log(`Installing dependencies: ${dependencies.join(", ")}`);
    try {
      execSync(`npm install ${dependencies.join(" ")}`, { stdio: "inherit" });
    } catch (error) {
      console.warn(
        "Failed to install dependencies automatically. Please install them manually."
      );
    }
  }
}
