import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/sub/",
  build: {
    outDir: path.resolve(__dirname, "../dist/sub"),
    emptyOutDir: true
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  css: {
    postcss: {}
  },
  server: {
    host: "0.0.0.0",
    port: 6003
  }
});
