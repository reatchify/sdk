// Copilot: CLI command logic for `reatchify init` to scaffold reatchify.config.ts

import * as fs from "fs";
import * as path from "path";
import prompts from "prompts";
import { showFancyLogo } from "./fancyLogo";
import {
  detectProjectType,
  getAvailableProjectTypes,
  type ProjectType,
} from "../core/project/projectTypeDetector";

const configTemplate = (projectType: ProjectType, enableAuth: boolean = true) =>
  JSON.stringify(
    {
      apiKey: "${REATCHIFY_API_KEY}",
      language: "auto",
      stateManagement: "zustand",
      httpClient: "axios",
      projectType: projectType,
      auth: {
        enabled: enableAuth,
      },
      // services: {
      //   include: ["users", "posts"] // Uncomment and customize to select specific services
      // },
    },
    null,
    2
  ) + "\n";

export async function runInit() {
  const configPath = path.resolve(process.cwd(), "reatchify.config.json");

  // Detect project type
  const detection = detectProjectType();
  console.log(
    `[reatchify] Detected project type: ${detection.detectedType} (${detection.confidence} confidence)`
  );
  if (detection.indicators.length > 0) {
    console.log(`[reatchify] Indicators: ${detection.indicators.join(", ")}`);
  }
  console.log();

  // Get user selection for project type
  const projectTypes = getAvailableProjectTypes();
  const defaultIndex = projectTypes.findIndex(
    (type) => type.value === detection.detectedType
  );

  const projectTypeResponse = await prompts({
    type: "select",
    name: "projectType",
    message: "Select your project type:",
    choices: projectTypes.map((type) => ({
      title: type.title,
      description: type.description,
      value: type.value,
    })),
    initial: defaultIndex >= 0 ? defaultIndex : 0,
  });

  if (!projectTypeResponse.projectType) {
    console.log("[reatchify] Aborted. No project type selected.");
    return;
  }

  const selectedProjectType = projectTypeResponse.projectType as ProjectType;

  // Ask about authentication
  const authResponse = await prompts({
    type: "confirm",
    name: "enableAuth",
    message: "Enable authentication (API key required for requests)?",
    initial: true,
  });

  const enableAuth = authResponse.enableAuth;

  // Check if config already exists
  if (fs.existsSync(configPath)) {
    const response = await prompts({
      type: "confirm",
      name: "overwrite",
      message: "A reatchify.config.json already exists. Overwrite it?",
      initial: false,
    });
    if (!response.overwrite) {
      console.log("[reatchify] Aborted. Config was not overwritten.");
      return;
    }
  }

  // Create config file
  fs.writeFileSync(configPath, configTemplate(selectedProjectType, enableAuth));
  await showFancyLogo("init");
  console.log("[reatchify] Created reatchify.config.json");
  console.log(`[reatchify] Project type set to: ${selectedProjectType}`);
  console.log(
    `[reatchify] Authentication ${enableAuth ? "enabled" : "disabled"}`
  );
  if (!enableAuth) {
    console.log(
      "[reatchify] Note: You can enable specific services by adding a 'services.include' array to your config"
    );
  }
}
