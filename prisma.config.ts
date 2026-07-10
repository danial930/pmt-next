import dotenv from "dotenv";
import path from "path";
import { defineConfig } from "prisma/config";

const appEnv = process.env.APP_ENV || "development";

dotenv.config({
  path: `.env.${appEnv}`,
});

export default defineConfig({
  schema: path.join(__dirname, "prisma/schema.prisma"),
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
