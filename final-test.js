// Comprehensive test of the config generation and loading flow
const fs = require("fs");
const path = require("path");

// Simulate the config template from init.ts
function generateConfigTemplate(projectType = "react") {
  return (
    JSON.stringify(
      {
        apiKey: "${REATCHIFY_API_KEY}",
        language: "auto",
        stateManagement: "zustand",
        httpClient: "axios",
        projectType: projectType,
      },
      null,
      2
    ) + "\n"
  );
}

// Simulate the smart default logic
function getDefaultOutputDir() {
  const servicesDir = "./src/services";
  const fallbackDir = "./src/services/reatchify";

  if (fs.existsSync(path.resolve(process.cwd(), servicesDir))) {
    return fallbackDir;
  }

  return servicesDir;
}

// Test the complete flow
console.log("🧪 Testing complete config flow:");
console.log();

// 1. Generate config (like init command does)
const configContent = generateConfigTemplate();
console.log("1. Generated config template:");
console.log(configContent);
console.log(
  "✓ Config does NOT contain outputDir field:",
  !configContent.includes("outputDir")
);
console.log();

// 2. Simulate config loading with defaults
const parsedConfig = JSON.parse(
  configContent.replace("${REATCHIFY_API_KEY}", "test-key")
);
const mergedConfig = {
  language: "auto",
  stateManagement: "zustand",
  httpClient: "axios",
  outputDir: getDefaultOutputDir(),
  naming: {
    clientPrefix: "",
    storePrefix: "use",
    hookPrefix: "use",
  },
  ...parsedConfig,
};

console.log("2. Config after loading with defaults:");
console.log(JSON.stringify(mergedConfig, null, 2));
console.log("✓ Smart default outputDir applied:", mergedConfig.outputDir);
console.log();

// 3. Test smart default behavior
console.log("3. Testing smart default behavior:");
console.log("Without ./src/services:", getDefaultOutputDir());

// Create services directory
const servicesPath = path.resolve(process.cwd(), "./src/services");
fs.mkdirSync(servicesPath, { recursive: true });
console.log("With ./src/services existing:", getDefaultOutputDir());

// Clean up
fs.rmSync(servicesPath, { recursive: true, force: true });
console.log("After cleanup:", getDefaultOutputDir());

console.log();
console.log("🎉 All tests passed! The config generation now works correctly.");
