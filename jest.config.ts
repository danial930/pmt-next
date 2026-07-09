import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^server-only$": "<rootDir>/src/__mocks__/server-only.ts",
  },
  testMatch: ["**/tests/**/*.test.ts"],
  setupFiles: ["<rootDir>/tests/setup.ts"],
  collectCoverageFrom: [
    "src/modules/**/*.ts",
    "src/core/**/*.ts",
    "!src/**/*.d.ts",
  ],
  transform: {
    "^.+\\.ts$": ["ts-jest", { tsconfig: { module: "commonjs" } }],
  },
};

export default config;
