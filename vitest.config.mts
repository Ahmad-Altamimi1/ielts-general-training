import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Same alias the app uses, so a test exercises the real module graph —
    // including the band scale, which is parsed from the generated content.
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts", "content/**/*.test.ts"],
  },
});
