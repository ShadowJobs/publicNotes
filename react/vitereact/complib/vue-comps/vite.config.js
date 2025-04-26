import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      include: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.vue'],
      outDir: 'dist',
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'vue-comps',
      fileName: (format) => `vue-comps.${format}.js`
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        },
        assetFileNames: (assetInfo) => {
          // if (assetInfo.name === 'style.css') return 'button.css';
          return assetInfo.name;
        },
        cssCodeSplit: false

      }
    }
  }
})