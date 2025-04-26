import path from "path"; // 这里是nodejs的模块，如果找不到，需要安装npm install @types/node -D
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig((cfg)=>{
  // 通过这种方式可以查看默认配置：
  //  { mode: 'development', command: 'serve', ssrBuild: false } ，command就是pnpm run dev，在本项目里，会运行vite serve
  // 可以根据上述参数的不同，来设置不同的配置
  console.log("vite.config.ts, is",cfg)
  return {
     
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  server: {
    host: "0.0.0.0",
    port: 6002,
    headers: {
      "Access-Control-Allow-Origin": "*"
    },
    proxy: {
      "/api/v1": {
        target: "https://gt-pipe-dev.mon.works",
        changeOrigin: true
      },
      "/api-ly":{
        target: "http://10.6.64.34:5000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-ly/, "")
      }
    }
  }
}
});
