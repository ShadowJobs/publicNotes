// import { Express } from "express";
// 使用上一句会报错
// https://expressjs.com/en/resources/middleware.html

// 启动 node app.js 这种方式无法看到log
// 所以可以安装$ npm i -g nodemon，然后nodemon app.js,就可以看到log了

const Express=require("express")
const fs=require("fs");
const { getJsonData } = require("./util");
const { log } = require("console");
const jobRouter = require("./jobs");
const chartDataRouter = require("./testData/chartTest");
const streamRouter = require("./streamApi");
const morgan = require("morgan");
const cors=require("cors")
const util=require("util");
const graphRouter = require("./graphql/graphtest");
const proxyRouter = require("./proxyApi");
const userRouter = require("./user");
const contentTypeRouter = require("./contentType");
const app=Express()
const rateLimit = require("express-rate-limit");
const slowDown = require("express-slow-down");
const { createProxyMiddleware } = require('http-proxy-middleware');
const {startWebsocket,wss}=require("./WebSocketApi")
const path = require("path");
const startPeerServer = require("./peerServer");


// 配置速度限制器
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15分钟
  delayAfter: 100, // 请求达到100次后开始限制
  delayMs: 500 // 每次请求都会增加500ms的延迟
});

// 配置率限制器
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 200, // 在15分钟内，每个IP最大请求次数为200
  message: { error: "请求过于频繁" }
});


// 将限制器应用到所有路由
app.use(speedLimiter);
app.use(limiter);
// 官方中间件
app.use(Express.json()) //配置接受post请求时，按json方式解析body的内容（仅针对application/json格式）
app.use(Express.urlencoded({ extended: true })) //配置接受post请求时，针对application/x-www-form-urllencoded格式
app.use(cors()) //允许跨域 //放到static前面，cors之前（本语句之前）的接口会被拦截

app.use(Express.static("./public")
// app.use(serveIndex("./public"))可以将public目录下的文件列出来，但是不会自动刷新，需要手动刷新（先serveIndex=require("serve-index")）
// 缓存部分见nodeLuncheServer.js，本文件只记录一下开启的一种方式
// ,{
//   etag: true, // 开启 ETag
//   lastModified: true,  // 开启 Last-Modified
//   setHeaders: (res, path) => {
//     res.setHeader('Cache-Control', 'public, max-age=3600') // 设置 Cache-Control 报头
//   }
// }
) //配置静态资源请求，当资源路径为public时，则返回资源内容，不用手动去一个个写接口 示例 http://localhost:5000/a.css
app.use("/res",Express.static("./public")) //请求时，必须加上/res 才能找,当有多个资源目录且有重名时，会优先找第一个匹配，所以加/res可以起到namespace的作用 示例 http://localhost:5000/res/a.css
// path.join(__dirname,"./public") 路径最好使用绝对路径，
// 资源路径查找的规则：<link ref="stylesheet" href="./res/a.css" />,这是一个相对路径，在不同的页面嵌入这个<link>得到的资源路径不一样，所以要用绝对路径，即以/开头

// 自定义中间件，放到所有的请求之前，那么所有的get, post等方法执行时，都会进入这个自定义的函数
log("self define middleware")
app.use((req,res,next)=>{
  log(req.method,req.url,new Date().toLocaleString()) //用年-月-日 时:分:秒
  next()
})
// app.use(morgan("tiny")) //官方提供的自动打印日志的中间件
// 限定了路由的use，只针对该路由生效，
app.use("/helloworld",(req,res,next)=>{
  log("only helloword")
  next() //本use里有2个函数，那么next会执行下一个，
},
(req,res,next)=>{
  log("second middleware")
  next()
})
// 上面可以将两个函数存到一个数组里，传给use，效果相同
// 可以对一个路由加多个中间件,这3个函数都会执行
app.use("/helloworld",(req,res,next)=>{
  log("third helloword")
  next()
})

// get也是use的变种，相当与限制了使用GET请求的use
app.get("/helloworld",(req,res,next)=>{
  // 这里面的next有什么用？如果在本函数结束后定义一个app.use,那么可以走进去。app.use会按顺序执行，并且匹配所有的请求
  // 所以，如果请求为/helloworld那么会先执行上一个use，然后next()会走进本函数，如果本函数再调用next()，会往下继续
  // 找匹配（因为helloworld已经匹配过了，所以不会再匹配路由，而是匹配下一个可use）
  console.log("get hellowold req");
  // res.send("Hello world") //发送数据的方法1,本方法的强大之处在于，可以发送对象，send自动会转换为json string

  // res.write("hello")
  // res.write("world2")
  // res.end()//发送数据的方法2

  res.end("<h1>hello world3</h1>")//发送数据的方法3
  next("route")
  // 特殊语法next("route"),不能在route中使用，如果加了route参数，那么会直接跳到third helloworld里
},(req,res,next)=>{
  log("after route") //上面用了next("route"),本行不会执行
  next()
})

app.use("/helloworld",()=>{ 
  log("4 hello里的next可以执行到这里")  
})

app.get("/error",(req,res)=>{
  // 控制返回状态码，多函数连写
  res.status(401).send("error info")
  
})
app.get("/error2",(req,res,next)=>{
  try {
    throw {msg:"error2",id:1}
  } catch (error) {
    next(error)//非route参数的next会跳过所有非error处理的中间件，直接进入错误处理的中间件（见下）
  }
})

app.get("/user/:id",(req,res)=>{
  //请求方式： http://localhost:5000/user/12?info=all 
  res.send({user:`userId=${req.params.id}`,info:req.query.info})
  // 获取params和query参数的方法
})

//读文件
app.get("/readfile",(req,res)=>{
  fs.readFile(path.join(__dirname,"./jsonTest/json1.json"),"utf-8",(err,data)=>{
    if(err){
      return res.status(500).json({error:err.message})
    }
    const d=JSON.parse(data)
    // http://localhost:5000/readfile
    return res.status(200).json(d.data)
  })
})

// 异步方式读文件
app.get("/rdasync",async (req,res)=>{
  try {
    const jsondata=await getJsonData()

    res.setHeader("Content-Type","application/json")
    res.status(200).json(jsondata)
  } catch (err) {
    
    return res.status(500).json({error:err.message})
  }
})

// -------------------------post部分
app.post("/write",(req,res)=>{
  console.log(req.body)
  // post方法测试需要用postman里，设置body类型为json或者x-www-form-urllencoded为{"a":1}，配合上面的app.use()接收指定的格式
  res.end(`success ${req.body.a}`)//这里得到的body是一个已经解析过的对象
})

// 直接转发，不做任何处理
app.use("/baidu-trans", createProxyMiddleware({ 
  target: 'http://api.fanyi.baidu.com', // 目标服务器地址
  changeOrigin: true, // 需要修改请求头中的源地址为目标服务器的地址
  pathRewrite: {
    '^/any': '', // 将请求路径中的/api替换为空
  },
  onProxyReq(proxyReq, req, res) {
      console.log('Target URL:', 'http://api.fanyi.baidu.com' + req.originalUrl);
  }
}));


app.use('/any', (req, res, next) => {
  // 获取请求中的目标 URL
  const targetUrl = req.query.url;
  if (!targetUrl) {
      return res.status(400).send({ error: 'Missing target URL' });
  }
  // 创建一个基于目标 URL 的动态代理
  const proxy = createProxyMiddleware({
      target: targetUrl,
      changeOrigin: true,
      pathRewrite: (path, req) => {
          // 删除原始路径中的 /any 和目标 URL，保留其他部分
          return path.replace(/^\/any/, '').replace(new URL(targetUrl).pathname, '');
      },
      onProxyReq(proxyReq, req, res) {
          console.log('Target URL:', targetUrl + req.originalUrl);
      }
  });
  // 使用这个动态代理处理当前请求
  proxy(req, res, next);
});

// ----------------模块化写法
app.use("/proxy-ly",proxyRouter)
app.use(jobRouter)
app.use("/a",jobRouter) //这种是带前缀的写法
app.use(chartDataRouter)
app.use("/graphql",graphRouter)
app.use("/stream",streamRouter)
app.use("/user-api",userRouter)
app.use("/ct",contentTypeRouter)

// app.route("/b").get().post() 连写写法

// ----------------404处理
app.use((req,res)=>{
  log("404")
  res.status(404).send("404 not found")
})

// ----------------错误处理中间件写法，传4个参数
app.use((err,req,res,next)=>{
  log(err)
  res.status(500).json({
    code:3,
    msg:"error occured in service",
    premsg:err.msg,
    formatErr:util.format(err) //格式化错误
  })
})


//----------------路由匹配语法 
// express使用path-to-regexp来做解析 讲解示例 https://www.bilibili.com/video/BV1mQ4y1C7Cn?p=23&spm_id_from=pageDriver&vd_source=8b372dea1018ca4ba01e5493f0aaaf82
const port=5000
// app.listen内部调用了 http.createServer(app).listen() ;
// server.keepAliveTimeout = 60000; // keep-alive的超时时间

const server=app.listen(port,(data)=>{
  console.log("start listen "+port); //每次修改本文件后，log都会自动输出
  console.log(data)
})
startWebsocket()
const io=startPeerServer(server)
require("./nodeLunchServer")

// 常用中间件
// 1， expres-validator,接口数据合法性验证库

// 2，存储加密密码，存db时用md5加密，而不是直接明文
//  const crypto=require("crypto")
// const ret=crypto.createHash("md5").update("123321").digest("hex") 得到md5,无法防止暴力破解，可以在123321中加入私钥(例如都加上mm，或者再做一次md5)