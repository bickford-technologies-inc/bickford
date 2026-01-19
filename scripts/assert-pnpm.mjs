import process from "process";

if (!process.env.npm_config_user_agent?.includes("pnpm")) {
  console.error("ERROR: pnpm is the only supported package manager.");
  process.exit(1);
}
