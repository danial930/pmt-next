import "dotenv/config";
import path from "path";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: path.join(__dirname, "schema.prisma"),
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
