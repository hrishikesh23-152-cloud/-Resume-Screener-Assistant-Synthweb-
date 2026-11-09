import dotenv from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createApp } from "./app.js";
import { connectToDatabase } from "./config/database.js";
import { loadConfig } from "./config/env.js";

async function start(): Promise<void> {
  dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../../.env") });
  const config = loadConfig();
  await connectToDatabase(config.MONGODB_URI);
  const app = createApp();
  const server = app.listen(config.PORT, () => {
    console.info(`Resume Screener API listening on port ${config.PORT}`);
  });

  const shutdown = () => {
    server.close(() => {
      void import("mongoose").then(({ default: mongoose }) => mongoose.disconnect());
    });
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

start().catch((error: unknown) => {
  console.error("Server startup failed. Check configuration and database connectivity.");
  process.exitCode = 1;
});
