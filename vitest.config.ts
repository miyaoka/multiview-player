import { fileURLToPath } from "node:url";
import { defineConfig, configDefaults } from "vitest/config";
import { createSharedPlugins } from "./vite.config";

export default defineConfig({
  plugins: createSharedPlugins(),
  test: {
    environment: "jsdom",
    exclude: [...configDefaults.exclude, "e2e/**"],
    root: fileURLToPath(new URL("./", import.meta.url)),
  },
});
