import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'ly-utils',
      fileName: (format) => `ly-utils.${format}.js`,
    },
    rollupOptions: {
      external: [], // 如果有外部依赖，在这里列出
      output: {
        globals: {
          // 如果有全局变量，在这里定义
        },
      },
    },
  }
});