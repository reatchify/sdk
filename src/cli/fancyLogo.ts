// Copilot: Fancy animated Reatchify logo using figlet and ascii-charts for CLI
import figlet from "figlet";
import fs from "fs";
import path from "path";

export async function showFancyLogo(mode: "init" | "generate" = "init") {
  // Render the Reatchify name in a big font
  const logoText = figlet.textSync("Reatchify", { font: "Big" });
  console.log("\x1b[36m" + logoText + "\x1b[0m");

  // Show SDK version from package.json
  let version = "?";
  try {
    const pkg = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, "../../package.json"), "utf-8")
    );
    version = pkg.version;
  } catch {}
  console.log(`\x1b[2mSDK Version: v${version}\x1b[0m`);

  // Show project info
  const cwd = process.cwd();
  const project = path.basename(cwd);
  console.log(`\x1b[2mProject: ${project}\x1b[0m`);

  if (mode === "init") {
    // After init: show what was done and next steps
    console.log("\n\x1b[1mConfig initialized!\x1b[0m");
    console.log(
      "  • Created \x1b[33mreatchify.config.json\x1b[0m in your project root"
    );
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
      "\x1b[1m│\x1b[0m Edit \x1b[33mreatchify.config.json\x1b[0m" +
        " ".repeat(10) +
        " | Customize your SDK" +
        " ".repeat(28) +
        "\x1b[1m│\x1b[0m"
    );
    console.log(
      "\x1b[1m│\x1b[0m \x1b[32mnpx reatchify auth set <API_KEY>\x1b[0m" +
        " ".repeat(5) +
        " | Set your API key" +
        " ".repeat(30) +
        "\x1b[1m│\x1b[0m"
    );
    console.log(
      "\x1b[1m│\x1b[0m \x1b[32mnpx reatchify generate\x1b[0m" +
        " ".repeat(15) +
        " | Scaffold your API client" +
        " ".repeat(21) +
        "\x1b[1m│\x1b[0m"
    );
    console.log(
      "\x1b[1m└─────────────────────────────────────────────────────────────────────────────────────┘\x1b[0m"
    );
    // Config docs link
    console.log(
      "\n\x1b[2mConfig Docs: https://docs.reatchify.com/configuration\x1b[0m\n"
    );
  } else if (mode === "generate") {
    // For generate, just show the logo and version, success message handled in generate.ts
    // Generation docs link can be shown after success
  }
}
