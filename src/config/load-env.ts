import dotenv from "dotenv";

dotenv.config({
  path: `.env.${process.env.APP_ENV ?? "development"}`,
});