// Copilot: Project type detection logic for reatchify

import * as fs from "fs";
import * as path from "path";

export type ProjectType =
  | "next"
  | "qwik"
  | "react"
  | "vite"
  | "vue"
  | "svelte"
  | "angular"
  | "vanilla"
  | "auto";

export interface ProjectDetectionResult {
  detectedType: ProjectType;
  confidence: "high" | "medium" | "low";
  indicators: string[];
}

/**
 * Detects the project type by analyzing package.json, environment variables, and project structure
 */
export function detectProjectType(
  projectRoot: string = process.cwd()
): ProjectDetectionResult {
  const indicators: string[] = [];
  let detectedType: ProjectType = "vanilla";
  let confidence: "high" | "medium" | "low" = "low";

  try {
    // Check package.json for framework dependencies
    const packageJsonPath = path.join(projectRoot, "package.json");
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
      const deps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      // Next.js detection
      if (deps["next"]) {
        detectedType = "next";
        indicators.push("Found Next.js dependency");
        confidence = "high";
      }
      // Qwik detection
      else if (deps["@builder.io/qwik"] || deps["qwik"]) {
        detectedType = "qwik";
        indicators.push("Found Qwik dependency");
        confidence = "high";
      }
      // Vite + React detection
      else if (deps["vite"] && (deps["react"] || deps["@types/react"])) {
        detectedType = "vite";
        indicators.push("Found Vite + React dependencies");
        confidence = "high";
      }
      // Vue detection
      else if (deps["vue"] || deps["@vue/cli-service"]) {
        detectedType = "vue";
        indicators.push("Found Vue.js dependency");
        confidence = "high";
      }
      // Svelte detection
      else if (deps["svelte"]) {
        detectedType = "svelte";
        indicators.push("Found Svelte dependency");
        confidence = "high";
      }
      // Angular detection
      else if (deps["@angular/core"] || deps["@angular/cli"]) {
        detectedType = "angular";
        indicators.push("Found Angular dependency");
        confidence = "high";
      }
      // React (Create React App or similar)
      else if (deps["react"] && deps["react-scripts"]) {
        detectedType = "react";
        indicators.push("Found Create React App setup");
        confidence = "high";
      }
      // Generic React
      else if (deps["react"]) {
        detectedType = "react";
        indicators.push("Found React dependency");
        confidence = "medium";
      }
    }

    // Check for framework-specific files and directories
    const nextConfigFiles = [
      "next.config.js",
      "next.config.mjs",
      "next.config.ts",
    ];
    const hasNextConfig = nextConfigFiles.some((file) =>
      fs.existsSync(path.join(projectRoot, file))
    );
    if (hasNextConfig && detectedType === "vanilla") {
      detectedType = "next";
      indicators.push("Found Next.js config file");
      confidence = "high";
    }

    const viteConfigFiles = [
      "vite.config.js",
      "vite.config.ts",
      "vite.config.mjs",
    ];
    const hasViteConfig = viteConfigFiles.some((file) =>
      fs.existsSync(path.join(projectRoot, file))
    );
    if (hasViteConfig && detectedType === "vanilla") {
      detectedType = "vite";
      indicators.push("Found Vite config file");
      confidence = "high";
    }

    // Check for framework-specific directories
    if (
      fs.existsSync(path.join(projectRoot, "pages")) &&
      detectedType === "vanilla"
    ) {
      detectedType = "next";
      indicators.push("Found pages/ directory (Next.js)");
      confidence = "medium";
    }

    if (
      fs.existsSync(path.join(projectRoot, "src/app")) &&
      detectedType === "vanilla"
    ) {
      detectedType = "next";
      indicators.push("Found src/app directory (Next.js App Router)");
      confidence = "medium";
    }

    if (
      fs.existsSync(path.join(projectRoot, "qwik-city.config.ts")) &&
      detectedType === "vanilla"
    ) {
      detectedType = "qwik";
      indicators.push("Found Qwik City config");
      confidence = "high";
    }

    // Check environment variables
    const envVars = process.env;
    if (envVars.NEXT_PUBLIC_API_URL || envVars.NEXTAUTH_URL) {
      if (detectedType === "vanilla") {
        detectedType = "next";
        indicators.push("Found Next.js environment variables");
        confidence = "medium";
      }
    }

    if (envVars.VITE_API_URL || envVars.VITE_APP_API_URL) {
      if (detectedType === "vanilla") {
        detectedType = "vite";
        indicators.push("Found Vite environment variables");
        confidence = "medium";
      }
    }
  } catch (error) {
    // If detection fails, fall back to vanilla
    indicators.push("Detection failed, defaulting to vanilla");
  }

  return {
    detectedType,
    confidence,
    indicators,
  };
}

/**
 * Gets a list of available project types for user selection
 */
export function getAvailableProjectTypes(): Array<{
  value: ProjectType;
  title: string;
  description: string;
}> {
  return [
    {
      value: "auto",
      title: "Auto-detect",
      description: "Automatically detect project type",
    },
    {
      value: "next",
      title: "Next.js",
      description: "React framework with SSR/SSG",
    },
    {
      value: "qwik",
      title: "Qwik",
      description: "Instant-loading web framework",
    },
    {
      value: "react",
      title: "React",
      description: "React application (CRA, custom)",
    },
    {
      value: "vite",
      title: "Vite + React",
      description: "Fast build tool with React",
    },
    {
      value: "vue",
      title: "Vue.js",
      description: "Progressive JavaScript framework",
    },
    {
      value: "svelte",
      title: "Svelte",
      description: "Cybernetically enhanced web apps",
    },
    {
      value: "angular",
      title: "Angular",
      description: "Platform for building web applications",
    },
    {
      value: "vanilla",
      title: "Vanilla JS/TS",
      description: "Plain JavaScript/TypeScript project",
    },
  ];
}
