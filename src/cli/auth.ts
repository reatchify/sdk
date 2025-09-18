// Copilot: CLI command logic for `reatchify auth set <API_KEY>` to save API key in .env

import fs from "fs";
import path from "path";

export function runAuthSet(apiKey: string) {
  const envPath = path.resolve(process.cwd(), ".env");
  let envContent = "";
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf-8");
    // Remove any existing REATCHIFY_API_KEY
    envContent = envContent.replace(/^REATCHIFY_API_KEY=.*$/m, "");
  }
  envContent += `\nREATCHIFY_API_KEY=${apiKey}\n`;
  fs.writeFileSync(envPath, envContent.trim() + "\n");
  console.log("[reatchify] API key saved to .env");
}
