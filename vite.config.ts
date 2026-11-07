import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("@react-three/drei")) return "three-drei";
          if (id.includes("@react-three/fiber")) return "three-fiber";
          if (id.includes("/three/")) return "three-core";
          if (id.includes("react-dom") || id.includes("/react/")) return "react-vendor";
          if (id.includes("@dimforge/rapier")) return "rapier";
        }
      }
    }
  },
  server: { host: "0.0.0.0" }
});
