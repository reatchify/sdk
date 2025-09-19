// Copilot: Write a TypeScript CLI using commander with commands init, auth set, and generate

// Copilot: CLI entrypoint for reatchify
import { Command } from "commander";

import { runInit } from "./init";
import { runAuthSet } from "./auth";
import { runGenerate } from "./generate";
import { showFancyLogo } from "./fancyLogo";

const program = new Command();

// Show logo before any command
function withLogo(
  fn: (...args: any[]) => any,
  mode: "init" | "generate" = "init"
) {
  return async (...args: any[]) => {
    await showFancyLogo(mode);
    return fn(...args);
  };
}

program.name("reatchify").description("Reatchify SDK CLI").version("0.1.0");

program
  .command("init")
  .description("Scaffold reatchify.config.json")
  .action(runInit);

program
  .command("auth set <API_KEY>")
  .description("Set API key for Reatchify")
  .action(withLogo(runAuthSet, "init"));

program
  .command("generate")
  .description("Generate SDK client code")
  .action(async () => {
    await Promise.resolve(runGenerate()).catch((err) => {
      console.error("[reatchify] Unhandled error:", err);
      process.exit(1);
    });
  });

program.parse(process.argv);
