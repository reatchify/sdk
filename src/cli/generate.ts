// Copilot: CLI command logic for `reatchify generate` to scaffold client code (stub)

import * as fs from "fs";
import * as path from "path";
import figlet from "figlet";
import prompts from "prompts";
import ora from "ora";
import chalk from "chalk";
import boxen from "boxen";
import cliProgress from "cli-progress";
import { loadConfig } from "../core/config/configLoader";
import { generateCode } from "../core";

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

export async function runGenerate() {
  // 🎨 Display awesome header
  console.clear();
  console.log(
    chalk.cyan(
      figlet.textSync("Reatchify", {
        font: "Small",
        horizontalLayout: "default",
      })
    )
  );
  console.log(chalk.gray("🚀 SDK Code Generator v0.0.2-beta.1\n"));

  const spinner = ora({
    text: chalk.blue("Initializing code generation..."),
    spinner: "dots",
  });

  try {
    spinner.start();
    const config = await loadConfig();
    spinner.succeed(chalk.green("Configuration loaded!"));

    // Check for existing generated files with gamified messaging
    const outputDir = path.resolve(config.outputDir || getDefaultOutputDir());

    const hasExistingFiles =
      fs.existsSync(outputDir) && fs.readdirSync(outputDir).length > 0;

    if (hasExistingFiles) {
      console.log(
        boxen(
          chalk.yellow("⚠️  Warning: Existing files detected!\n\n") +
            chalk.white(
              `Found generated files in: ${chalk.cyan(outputDir)}\n`
            ) +
            chalk.gray("This action will overwrite existing code."),
          {
            padding: 1,
            margin: 0,
            borderStyle: "round",
            borderColor: "yellow",
          }
        )
      );

      const response = await prompts({
        type: "confirm",
        name: "continue",
        message: chalk.red(
          "🔥 Proceed with code generation? (This will overwrite files)"
        ),
        initial: false,
      });

      if (!response.continue) {
        console.log(chalk.red("❌ Generation cancelled. Your files are safe!"));
        console.log(
          chalk.gray("💡 Tip: Use --dry-run to preview changes first")
        );
        return;
      }
    }

    // 🎯 Start the generation process with progress tracking
    console.log(chalk.blue("🚀 Starting code generation..."));

    const progressBar = new cliProgress.SingleBar({
      format:
        chalk.cyan("Generating") +
        " |" +
        chalk.cyan("{bar}") +
        "| {percentage}% || {value}/{total} steps || {stage}",
      barCompleteChar: "\u2588",
      barIncompleteChar: "\u2591",
      hideCursor: true,
    });

    progressBar.start(100, 0, { stage: "Initializing..." });

    // Simulate progress updates (in real implementation, this would be tied to actual progress)
    setTimeout(
      () => progressBar.update(20, { stage: "Fetching schema..." }),
      500
    );
    setTimeout(
      () => progressBar.update(40, { stage: "Processing endpoints..." }),
      1000
    );
    setTimeout(
      () => progressBar.update(60, { stage: "Generating types..." }),
      1500
    );
    setTimeout(
      () => progressBar.update(80, { stage: "Creating client..." }),
      2000
    );

    await generateCode(config);

    progressBar.update(100, { stage: "Complete! 🎉" });
    progressBar.stop();

    // 🎉 Success celebration
    console.log(
      boxen(
        chalk.green("🎉 Code Generation Complete!\n\n") +
          chalk.white("Your API client is ready to rock! 🚀\n\n") +
          chalk.cyan(`📁 Generated in: ${outputDir}\n`) +
          chalk.yellow("⭐ Achievement Unlocked: API Master"),
        {
          padding: 1,
          margin: 0,
          borderStyle: "double",
          borderColor: "green",
        }
      )
    );

    // 📋 Next steps with modern styling
    console.log(
      boxen(
        chalk.blue("📋 Next Steps:\n\n") +
          chalk.white("1. ") +
          chalk.cyan("Import") +
          chalk.white(" your client: ") +
          chalk.gray("import { api } from './src/services'\n") +
          chalk.white("2. ") +
          chalk.cyan("Explore") +
          chalk.white(" generated types in ") +
          chalk.gray("./src/services/types\n") +
          chalk.white("3. ") +
          chalk.cyan("Customize") +
          chalk.white(" config in ") +
          chalk.gray("reatchify.config.json\n") +
          chalk.white("4. ") +
          chalk.cyan("Re-run") +
          chalk.white(" anytime: ") +
          chalk.gray("npx reatchify generate"),
        {
          padding: 1,
          margin: 0,
          borderStyle: "round",
          borderColor: "blue",
        }
      )
    );

    console.log(chalk.gray("📚 Docs: https://docs.reatchify.com/codegen"));
    console.log(chalk.magenta("💖 Happy coding with Reatchify!"));
  } catch (err) {
    spinner.fail(chalk.red("Generation failed"));

    let msg = err instanceof Error ? err.message : String(err);

    console.log(
      boxen(
        chalk.red("❌ Oops! Something went wrong:\n\n") +
          chalk.white(msg) +
          "\n\n" +
          chalk.yellow("💡 Need help? Check our docs or create an issue."),
        {
          padding: 1,
          margin: 0,
          borderStyle: "round",
          borderColor: "red",
        }
      )
    );

    // Show helpful next steps
    console.log(
      boxen(
        chalk.blue("🔧 Quick Fixes:\n\n") +
          chalk.white("• ") +
          chalk.cyan("npx reatchify init") +
          chalk.white(" - Create config file\n") +
          chalk.white("• ") +
          chalk.cyan("npx reatchify auth set <API_KEY>") +
          chalk.white(" - Set API key\n") +
          chalk.white("• ") +
          chalk.cyan("npx reatchify generate --dry-run") +
          chalk.white(" - Test generation"),
        {
          padding: 1,
          margin: 0,
          borderStyle: "round",
          borderColor: "blue",
        }
      )
    );

    console.log(
      chalk.gray("📚 Docs: https://docs.reatchify.com/troubleshooting")
    );
    process.exit(1);
  }
}
