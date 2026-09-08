// Standalone offline build used by the packaged desktop app.
// Renders the same page component without SSR or the router.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  base: "./",
  root: path.resolve(__dirname, "electron/renderer"),
  publicDir: path.resolve(__dirname, "public"),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  build: {
    outDir: path.resolve(__dirname, "dist-electron/renderer"),
    emptyOutDir: true,
  },
});
