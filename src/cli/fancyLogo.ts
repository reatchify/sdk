// Copilot: Fancy animated Reatchify logo using figlet and ascii-charts for CLI
import figlet from "figlet";
import fs from "fs";
import path from "path";
import boxen from "boxen";
import chalk from "chalk";

export async function showFancyLogo(mode: "init" | "generate" = "init") {
  // Render the Reatchify name in a big font
  const logoText = figlet.textSync("Reatchify", { font: "Big" });
  console.log(chalk.cyan(logoText));

  // Show SDK version from package.json
  let version = "?";
  try {
    const pkg = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, "../../package.json"), "utf-8")
    );
    version = pkg.version;
  } catch {}
  console.log(chalk.gray(`SDK Version: v${version}`));

  // Show project info
  const cwd = process.cwd();
  const project = path.basename(cwd);
  console.log(chalk.gray(`Project: ${project}`));

  if (mode === "init") {
    // After init: show what was done and next steps
    console.log(
      boxen(
        chalk.green("✅ Config initialized!\n\n") +
          chalk.white("• Created ") +
          chalk.cyan("reatchify.config.json") +
          chalk.white(" in your project root"),
        {
          padding: 1,
          margin: 0,
          borderStyle: "round",
          borderColor: "green",
        }
      )
    );

    console.log(
      boxen(
        chalk.blue("📋 Next Steps:\n\n") +
          chalk.white("1. ") +
          chalk.cyan("Edit reatchify.config.json") +
          chalk.white(" - Customize your SDK\n") +
          chalk.white("2. ") +
          chalk.green("npx reatchify auth set <API_KEY>") +
          chalk.white(" - Set your API key\n") +
          chalk.white("3. ") +
          chalk.green("npx reatchify generate") +
          chalk.white(" - Scaffold your API client"),
        {
          padding: 1,
          margin: 0,
          borderStyle: "round",
          borderColor: "blue",
        }
      )
    );

    console.log(
      chalk.gray("📚 Config Docs: https://docs.reatchify.com/configuration")
    );
  } else if (mode === "generate") {
    // For generate, just show the logo and version, success message handled in generate.ts
    // Generation docs link can be shown after success
  }
}
