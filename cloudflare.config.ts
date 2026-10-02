import { defineConfig } from "cf/config";

export default defineConfig({
  worker: {
    name: "multiview-player",
    compatibilityDate: "2026-09-25",
    assets: { notFoundHandling: "single-page-application" },
  },
});
