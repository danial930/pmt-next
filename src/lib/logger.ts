import "server-only";
import pino from "pino";

const isDev = process.env.NODE_ENV === "development";

export const logger = pino({
  level: isDev ? "debug" : "info",
  ...(isDev && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
      },
    },
  }),
  redact: [
    "*.password",
    "*.token",
    "*.refreshToken",
    "*.accessToken",
    "*.tokenHash",
  ],
});

export const auditLogger = pino({ name: "audit" });
