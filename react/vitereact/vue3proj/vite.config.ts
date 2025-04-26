import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/vue3/",
  build: {
    outDir: path.resolve(__dirname, "../dist/vue3"),
    emptyOutDir: true
  },
  server: {
    host: "0.0.0.0",
    port: 6004
  },
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
