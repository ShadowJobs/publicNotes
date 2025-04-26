const express = require("express")
const proxyRouter = express.Router()
const http = require('http');
const url = require('url');
const NodeCache = require("node-cache");
const { log, dir } = require("console")
const fs=require("fs");
const path = require("path");
const send=require("send")
const client=require("./db/redis_con")

const nodePersist = require('node-persist');
nodePersist.init();//  默认缓存位置在当前目录下的.node-persist/storage下
//  nodePersist.init({"dir":"~/ly/cache/node-persist"});

const flatCache = require('flat-cache');
let flat_cache = flatCache.load('productsCache');
// let cache = flatCache.load('cacheId', path.resolve('./path/to/cache/folder'));，第二个参数改存储位置

const myCache = new NodeCache();
function getCacheKey(req) {
  return req.url + '|' + req.headers['range'];
}

//---------- 转发，解决跨域
proxyRouter.get('/outer', async (req, res) => {
  const targetUrl = req.query.url;
  const cacheType = req.query.cache;
  const parsedUrl = url.parse(targetUrl);
  const options = {
    hostname: parsedUrl.hostname,
    port: parsedUrl.port || 80,
    path: parsedUrl.path,
    method: 'GET'
  };

  if (cacheType === 'no-cache') {
    // 方式1： 直接转发，无缓存
    const proxy = http.request(options, function (targetRes) {
      res.writeHead(targetRes.statusCode, targetRes.headers);
      targetRes.pipe(res, { end: true });
    });
    req.pipe(proxy, { end: true });
    proxy.on('error', function (err) {
      res.status(500).send(err.message);
    });
  } else if (cacheType === 'node-cache') {
    // 方式2：使用node-cache缓存，内存缓存
    log("getCacheKey", req.url, req.headers['range'])
    // dir(req.headers)
    if (myCache.has(getCacheKey(req))) {
      log("命中cache")
      const cachedData = myCache.get(getCacheKey(req));
      res.writeHead(200, { 'Content-Type': 'video/mp4' }); // 根据你的视频类型设置正确的 content-type
      res.end(cachedData); // 返回缓存数据
    } else {
      log("未命中 cache ,")
      const proxy = http.request(options, function (targetRes) {
        let data = [];
        targetRes.on('data', chunk => data.push(chunk)); // 收集数据
        targetRes.on('end', () => {
          const bodyBuffer = Buffer.concat(data);
          myCache.set(getCacheKey(req), bodyBuffer); // 缓存数据
          res.writeHead(targetRes.statusCode, targetRes.headers);
          res.end(bodyBuffer); // 发送数据
          log("已缓存，发送完成")
        });
      });
      proxy.end(); // 由于是GET请求，所以这里没有写入请求体
    }
  } else if (cacheType == "redis") {
    // 方式3：使用redis缓存 (参看官方git里的readme.md)
    log("redis getCacheKey", req.url, req.headers['range'])
    const cacheKey = getCacheKey(req);
    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      log("命中Redis cache")
      res.writeHead(200, { 'Content-Type': 'video/mp4' }); // 根据你的视频类型设置正确的 content-type
      res.end(Buffer.from(cachedData, 'base64')); // 返回缓存数据
    } else {
      log("未命中 Redis cache ,")
      const proxy = http.request(options, function (targetRes) {
        let data = [];
        targetRes.on('data', chunk => { log("get chunk"); data.push(chunk) }); // 收集数据
        targetRes.on('end', async () => {
          const bodyBuffer = Buffer.concat(data);
          await client.set(cacheKey, bodyBuffer.toString('base64'), 'EX', 3600); // 缓存数据到Redis，设置过期时间为1小时.存string后无法快进
          res.writeHead(targetRes.statusCode, targetRes.headers);
          res.end(bodyBuffer); // 发送数据
          log("已缓存到Redis，发送完成")
        });
      });
      proxy.end(); // 由于是GET请求，所以这里没有写入请求体
    }
    // });
  } else if (cacheType === 'node-persist') {
    // 方式4：使用node-persist缓存，本地缓存
    log("nodePersist getCacheKey", req.url, req.headers['range'])
    const cacheKey = getCacheKey(req);
    const cachedData = await nodePersist.getItem(cacheKey);
    if (cachedData) {
      log("命中node persist cache")
      res.writeHead(200, { 'Content-Type': 'video/mp4' }); // 根据你的视频类型设置正确的 content-type
      res.end(Buffer.from(cachedData)); // 返回缓存数据    坑：一定要Buffer.from
    } else {
      log("未命中 node persist cache ,")
      const proxy = http.request(options, function (targetRes) {
        let data = [];
        targetRes.on('data', chunk => data.push(chunk)); // 收集数据
        targetRes.on('end', async () => {
          const bodyBuffer = Buffer.concat(data);
          await nodePersist.setItem(cacheKey, bodyBuffer); // 缓存数据 (这样更好，前端可以点快进，但是flat-cache就不行)
          res.writeHead(targetRes.statusCode, targetRes.headers);
          res.end(bodyBuffer); // 发送数据
          log("已缓存node persist，发送完成")
        });
      });

      proxy.end(); // 由于是GET请求，所以这里没有写入请求体
    }
  } else if (cacheType == 'flat-cache') {
    // 方式5：使用flat-cache缓存，本地缓存
    log("flat-cache getCacheKey", req.url, req.headers['range'])
    const cacheKey = getCacheKey(req);
    const cachedData = flat_cache.getKey(cacheKey);
    if (cachedData) {
      log("命中flat cache")
      res.writeHead(200, { 'Content-Type': 'video/mp4' }); // 根据你的视频类型设置正确的 content-type
      res.end(Buffer.from(cachedData, 'base64')); // 返回缓存数据
    } else {
      log("未命中 flat cache ,")
      const proxy = http.request(options, function (targetRes) {
        let data = [];
        targetRes.on('data', chunk => { log("get chunk"); data.push(chunk) }); // 收集数据
        targetRes.on('end', async () => {
          const bodyBuffer = Buffer.concat(data);
          flat_cache.setKey(cacheKey, bodyBuffer.toString('base64'));//这么存的数据，无法点快进
          flat_cache.save();
          res.writeHead(targetRes.statusCode, targetRes.headers);
          res.end(bodyBuffer); // 发送数据
          log("已缓存flat cache，发送完成")
        });
      });
      proxy.end(); // 由于是GET请求，所以这里没有写入请求体
    }

  }
});


proxyRouter.get('/self/stream', async (req, res) => {
  const vid=req.query.vid
  const _path = path.join(__dirname,'./public/bunny.mp4'); //坑：相对路径是相对于node命令执行时的路径，不是本文件的，所以要改成本文件的相对路径
  const stat = fs.statSync(_path);
  const fileSize = stat.size;
  const range = req.headers.range;
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize-1;
    if(start >= fileSize) {
      res.status(416).send('Requested range not satisfiable\n'+start+' >= '+fileSize);
      return;
    }
    const chunksize = (end-start)+1;
    const file = fs.createReadStream(_path, {start, end});
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(200, head);
    fs.createReadStream(_path).pipe(res);
  }
})
proxyRouter.get('/staticv/stream', function(req, res){
  const _path = path.join(__dirname,'./public/bunny.mp4'); //坑：相对路径是相对于node命令执行时的路径，不是本文件的，所以要改成本文件的相对路径
  log("static resource in public")
  send(req, _path)
    .on('headers', function (res) {
      res.setHeader('Accept-Ranges', 'bytes')
    })
    .pipe(res)
});

proxyRouter.post('/', (req, res) => {
  const targetUrl = req.query.url;
  const parsedUrl = url.parse(targetUrl);

  const options = {
    hostname: parsedUrl.hostname,
    port: parsedUrl.port || 80,
    path: parsedUrl.path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Copy other headers if needed...
    }
  };

  const proxy = http.request(options, function (targetRes) {
    res.writeHead(targetRes.statusCode, targetRes.headers);
    targetRes.pipe(res, {
      end: true
    });
  });
  proxy.write(JSON.stringify(req.body)); // Write request body to the proxy request
  proxy.end();

});

// 二，通过axios设置代理转发，好处是可以动态配置target，劣势是，需要自己处理错误，比如404，500等
// const axios = require('axios');
// app.use('/api', async (req, res) => {
//   const url = 'http://target-server.com' + req.url;
//   try {
//     const response = await axios({ 
//       url: url,
//       method: req.method, 
//       data: req.body
//     });
//     return res.json(response.data);
//   } catch(error) {
//     // 错误处理
//     if(error.response){
//       return res.status(error.response.status).json({ error: error.response.data });
//     }
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// 三，使用node request库，注意request库已经不再维护
// const request = require('request');
// app.use('/api', (req, res) => {
//   const url = 'http://target-server.com' + req.url;
//   req.pipe(request(url)).pipe(res);
// });



module.exports = proxyRouter