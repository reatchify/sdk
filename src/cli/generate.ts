// Copilot: CLI command logic for `reatchify generate` to scaffold client code (stub)

import * as fs from "fs";
import * as path from "path";
import prompts from "prompts";
import { loadConfig } from "../core/configLoader";
import { generateCode } from "../core/generate";

export async function runGenerate() {
  try {
    const config = await loadConfig();

    // Check for existing generated files
    const outputDir = path.resolve(
      config.outputDir || "./src/generated/reatchify"
    );
    const hasExistingFiles =
      fs.existsSync(outputDir) && fs.readdirSync(outputDir).length > 0;

    if (hasExistingFiles) {
      console.log(
        `[reatchify] ⚠️  Found existing generated files in: ${outputDir}`
      );
      console.log(
        "[reatchify] Any existing code or modifications will be lost!"
      );

      const response = await prompts({
        type: "confirm",
        name: "continue",
        message:
          "Continue with code generation? This will overwrite existing files.",
        initial: false,
      });

      if (!response.continue) {
        console.log("[reatchify] Aborted. Code generation cancelled.");
        return;
      }
    }

    await generateCode(config);
    console.log("\x1b[32m[reatchify] Code generation complete!\x1b[0m");
    console.log(
      "  • Your typed API client and models are ready in \x1b[33m./src/generated/reatchify\x1b[0m"
    );
    console.log();
    console.log(
      "\x1b[1m┌─────────────────────────────────────────────────────────────────────────────────────┐\x1b[0m"
    );
    console.log(
      "\x1b[1m│ Next Steps                                                                       │\x1b[0m"
    );
    console.log(
      "\x1b[1m├─────────────────────────────────────────────────────────────────────────────────────┤\x1b[0m"
    );
    console.log(
      "\x1b[1m│\x1b[0m Import and use your generated client in your app" +
        " ".repeat(17) +
        "\x1b[1m│\x1b[0m"
    );
    console.log(
      "\x1b[1m│\x1b[0m Explore \x1b[33m./src/generated/reatchify\x1b[0m for types and hooks" +
        " ".repeat(13) +
        "\x1b[1m│\x1b[0m"
    );
    console.log(
      "\x1b[1m│\x1b[0m Edit \x1b[33mreatchify.config.json\x1b[0m and re-run \x1b[32mnpx reatchify generate\x1b[0m" +
        " ".repeat(2) +
        "\x1b[1m│\x1b[0m"
    );
    console.log(
      "\x1b[1m└─────────────────────────────────────────────────────────────────────────────────────┘\x1b[0m"
    );
    // Generation docs link
    console.log(
      "\n\x1b[2mCodegen Docs: https://docs.reatchify.com/codegen\x1b[0m\n"
    );
  } catch (err) {
    let msg = err instanceof Error ? err.message : String(err);
    console.error("\x1b[31m[reatchify] Error: " + msg + "\x1b[0m");
    // Show clickable commands for next steps
    console.log(
      "\n\x1b[1m┌─────────────────────────────────────────────────────────────────────────────────────┐\x1b[0m"
    );
    console.log(
      "\x1b[1m│ Next Steps                                                                       │\x1b[0m"
    );
    console.log(
      "\x1b[1m├─────────────────────────────────────────────────────────────────────────────────────┤\x1b[0m"
    );
    console.log(
      "\x1b[1m│\x1b[0m \x1b[4;34mnpx reatchify init\x1b[0m" +
        " ".repeat(17) +
        " | Create a config file" +
        " ".repeat(26) +
        "\x1b[1m│\x1b[0m"
    );
    console.log(
      "\x1b[1m│\x1b[0m \x1b[4;34mnpx reatchify auth set <API_KEY>\x1b[0m" +
        " ".repeat(4) +
        " | Set your API key" +
        " ".repeat(30) +
        "\x1b[1m│\x1b[0m"
    );
    console.log(
      "\x1b[1m└─────────────────────────────────────────────────────────────────────────────────────┘\x1b[0m"
    );
    console.log(
      "\n\x1b[2mConfig Docs: https://docs.reatchify.com/configuration\x1b[0m\n"
    );
    process.exit(1);
  }
}
