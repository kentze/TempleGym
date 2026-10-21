import path from "node:path";
import dotenv from "dotenv";

// Load the .env file from apps/server
dotenv.config({ path: path.join(__dirname, "apps/server/.env") });

import { defineConfig } from "@prisma/config";

export default defineConfig({
  schema: "apps/server/prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
