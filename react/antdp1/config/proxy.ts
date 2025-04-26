/**
 * 在生产环境 代理是无法生效的，所以这里没有生产环境的配置
 * -------------------------------
 * The agent cannot take effect in the production environment
 * so there is no configuration of the production environment
 * For details, please see
 * https://pro.ant.design/docs/deploy
 */
export default {
  dev: {
    // localhost:8000/api/** -> https://preview.pro.ant.design/api/**
    '/api/': {
      // 要代理的地址
      target: 'https://preview.pro.ant.design',
      // 配置了这个可以从 http 代理到 https
      // 依赖 origin 的功能可能需要这个，比如 cookie
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
    '/api-ly/': {
      target: 'http://localhost:5000',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
    '/browser-cache/': {
      target: 'http://localhost:5002/',
      changeOrigin: true,
      pathRewrite: { '^/browser-cache/': '' },
    },
    '/api-python/': {
      target: 'http://localhost:5003/',
      changeOrigin: true,
      pathRewrite: { '^/api-python/': '' }, //去掉 /api-python/ 的写法
      logLevel: 'debug', // 增加调试日志
      onProxyReq: (proxyReq, req, res) => {
        console.log(`原始请求: ${req.method} ${req.url}`);
        console.log(`代理请求: ${proxyReq.method} ${proxyReq.path}`);
        // proxyReq是会被发送到服务器的请求对象
            // 添加 CORS 头
        // proxyReq.headers['Access-Control-Allow-Origin'] = '*';
        // proxyReq.headers['Access-Control-Allow-Headers'] = 'Authorization, Content-Type';
        console.log('proxyReq.headers:', proxyReq.headers);
        // 添加自定义头
        if(!proxyReq.headers) proxyReq.headers={}
        proxyReq.headers['Authorization']="Bearer 123sldfjlasjfwiejqrpiq"
        // proxyReq.setHeader('Authorization', 'Bearer 123sldfjlasjfwiejqrpiq');
      
      },
      onError: (err, req, res) => {
        console.error('Proxy error:', err);
      }
  
    },
  },
  test: {
    '/api/': {
      target: 'https://proapi.azurewebsites.net',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
  pre: {
    '/api/': {
      target: 'your pre url',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
};
