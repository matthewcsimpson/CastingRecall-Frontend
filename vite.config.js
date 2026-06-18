/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// Mirror the CRA `jsconfig.json` baseUrl: "src" so absolute imports
// like `constants/config` keep resolving.
const srcDirs = [
  "assets",
  "components",
  "constants",
  "hooks",
  "pages",
  "styles",
  "utilities",
];

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: Object.fromEntries(
      srcDirs.map((dir) => [dir, path.resolve(__dirname, "src", dir)]),
    ),
  },
  build: {
    // Keep CRA's output directory so existing deploy config still works.
    outDir: "build",
  },
  server: {
    port: 3000,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.js",
    unstubEnvs: true,
  },
});
