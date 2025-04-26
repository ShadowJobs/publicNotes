// 用node自带的服务器，不用express的写法
// https://www.bilibili.com/video/BV1Jr4y1v7Nc?p=6&spm_id_from=pageDriver&vd_source=8b372dea1018ca4ba01e5493f0aaaf82
// 实际antdp里的使用方案是：强制缓存。但是在文件名上加上hash，这样每次文件内容改变，文件名也会改变，浏览器就会重新请求
// 所以js不宜将所有文件打成1个包，而是应该分成多个包，每个包都有自己的hash，这样只要某个包的内容改变，就只会请求这个包
const http=require("http")
const fs=require("fs")
const url=require("url")
const { log } = require("console")
const etag = require("etag")
const exptime="2023-09-17 19:21:40"
const relativeTime=3

const currentDirectory = process.cwd();
const isProduction = process.argv.includes('--prod');
console.log("isProduction",isProduction)
const rootPath=isProduction?`${currentDirectory}/../antdp1`:"../../react/antdp1/public"
const serverPath="/public"
const nodeLunchPort = 5005
const nodeLunchUrl = `http://localhost:${nodeLunchPort}`
const server=http.createServer((req,res)=>{
  console.log(req.method,req.url)
  const {pathname,query}=url.parse(req.url,true)
  try {
  if(pathname==="/"){
    res.setHeader("Content-Type","text/html;charset=utf-8")
    res.write(`
      <html>
        <head>
          <base href="${isProduction?"/api-node-server/":"/"}"/>
        </head>
      <div>
      <br/>
      <h1>坑1：base必须以/结尾，否则base规则不生效</h1>
      网页里的图片会使用缓存策略 （这里会自动请求到下面的/img）,但是直接在浏览器里输入http://localhost:5002/img是不会使用缓存策略的
      在chrome,edge里，浏览器会自动在请求头里加上max-age=0，即使server设置了强制缓存，也无效
      在safari里不会自动加max-age=0，但是依然不会使用缓存，每次都是重新请求，
      猜测原理是：直接输入url，浏览器会认为是用户主动输入，所以不会使用缓存策略
      <br/>
      <img src="img" alt="tang" width="200" height="200"/>
      强制缓存，固定${exptime}过期<br/>
      <img src="img2" alt="girl" width="200" height="280"/>
      相对缓存，${relativeTime}秒内不会再次请求<br/>
      <img src="img3" alt="ljr" width="200" height="220"/>
      lastmodified协商+max-age相对<br/>
      <img src="etagpic" alt="etag" width="150" height="150"/>
      etag协商<br/>
    </div>
    </html>`)
    res.end()
  }else if(pathname==="json"){
    res.setHeader("Content-Type","application/json")
    res.write(JSON.stringify({name:"lin"}))
    res.end()
  }else if(pathname==="/favicon.ico"){
    const data=fs.readFileSync(`${rootPath}/a.jpg`)
    res.writeHead(200,{"Expires":new Date("2027-09-17 19:21:40").toUTCString()})
    res.end(data)
  }else if(pathname==="/img"){ //强制缓存，固定过期时间
    const data=fs.readFileSync(`${rootPath}/tang.jpg`)
    res.writeHead(200,{"Expires":new Date("2023-09-17 19:21:40").toUTCString()})
    res.end(data)
  }else if(pathname==="/img2"){ //
    console.log(currentDirectory);
    const data=fs.readFileSync(`${currentDirectory}${serverPath}/img2.jpg`) //坑：tang.jpg能访问，img2.jpg访问不到
    res.writeHead(200,{"Cache-Control":`max-age=${relativeTime}`}) //相对与第一次请求的时间，3秒内不会再次请求
    //max-age和s-maxage的区别是，s-maxage只对代理服务器有效,必须先设置public，max-age对浏览器和代理服务器都有效

    // res.writeHead(200,{"Cache-Control":"no-store"})//强制不缓存，优先级高于Expires
    // res.writeHead(200,{"Cache-Control":"no-chahe"})//协商缓存，优先级高于Expires
    // no-cache和no-store互斥，只能设置一个
    
    // res.writeHead(200,{"Cache-Control":"private"})//只有浏览器可以缓存，代理服务器不可以缓存
    // res.writeHead(200,{"Cache-Control":"public"})//浏览器和代理服务器都可以缓存，
    // private和public也是互斥的

    //多个Cache-Control可以同时设置，以逗号分隔
    // 例如：res.writeHead(200,{"Cache-Control":"max-age=3,public"})

    res.end(data)
  }else if(pathname==="/img3"){ //协商缓存，询问服务器文件是否改变，如果没有改变，返回304，浏览器使用缓存
    const {mtime}=fs.statSync(`${rootPath}/a.jpg`)
    const lastModified=mtime.toUTCString()
    const ifModifiedSince=req.headers["if-modified-since"]
    log(lastModified)
    log(ifModifiedSince) //这个值在第一次请求时是undefined，第二次请求时是上一次请求的lastModified，如果清除浏览器缓存，那么就是undefined
    // 实测浏览器Bug:chrome对于只设置了last-modified的请求，有时候会主动屏蔽请求，直接读缓存，而不是先往服务器验证，应该配合max-age使用
    if(ifModifiedSince && ifModifiedSince==lastModified){
      res.writeHead(304)
      res.end()
      return
    }
    res.writeHead(200,{
      "Last-Modified":lastModified,
      "Cache-Control":"max-age=10"//这里如果不设置，浏览器会按自己的策略来判断是否使用缓存（所以有时候会漏请求，比如server有修改，
      // 但是浏览器没更新，必须清除缓存才能看到更新），如果设置了，浏览器就会按照这个策略来判断
    })
    // res.writeHead(200,{"Cache-Control":"no-cache"}) //设置了last-modified后不需要再设置no-cache

    const data=fs.readFileSync(`${rootPath}/a.jpg`)
    res.end(data)
  }else if(pathname==="/etagpic"){ //协商缓存etag
    // etag不适合做图片的缓存方案，因为图片通常是整张替换。
    const currentDirectory = process.cwd();
    const data=fs.readFileSync(`${currentDirectory}${serverPath}/etagpic.png`)
    const etagStr=etag(data)
    // etag缺点：会消耗计算（对比文件内容）
    const ifNoneMatch=req.headers["if-none-match"]
    if(ifNoneMatch && ifNoneMatch==etagStr){
      res.writeHead(304)
      res.end()
      return
    }
    res.writeHead(200,{"Etag":etagStr})
    // 不用设置Cache-Control
    res.end(data)

  }else if(pathname==="/jsonp"){
    res.setHeader("Content-Type","application/json")
    res.write(`${query.callback}(${JSON.stringify({name:"lin"})})`)
    res.end()
  }else if(pathname==="/cors"){
    res.setHeader("Content-Type","application/json")
    res.setHeader("Access-Control-Allow-Origin",nodeLunchUrl)
    res.write(JSON.stringify({name:"lin"}))
    res.end()
  }else if(pathname==="/cors2"){
    res.setHeader("Content-Type","application/json")
    res.setHeader("Access-Control-Allow-Origin","*")
    res.write(JSON.stringify({name:"lin"}))
    res.end()
  }else if(pathname==="/cors3"){
    res.setHeader("Content-Type","application/json")
    res.setHeader("Access-Control-Allow-Origin",nodeLunchUrl)
    res.setHeader("Access-Control-Allow-Headers","X-Token,Content-Type")
    res.write(JSON.stringify({name:"lin"}))
    res.end()
  }else if(pathname==="/cors4"){
    res.setHeader("Content-Type","application/json")
    res.setHeader("Access-Control-Allow-Origin",nodeLunchUrl)
    res.setHeader("Access-Control-Allow-Headers","X-Token,Content-Type")
    res.setHeader("Access-Control-Allow-Methods","PUT")
    res.write(JSON.stringify({name:"lin"}))
    res.end()
  }else if(pathname==="/cors5"){
    res.setHeader("Content-Type","application/json")
    res.setHeader("Access-Control-Allow-Origin",nodeLunchUrl)
    res.setHeader("Access-Control-Allow-Headers","X-Token,Content-Type")
    res.setHeader("Access-Control-Allow-Methods","PUT")
    res.setHeader("Access-Control-Allow-Credentials",true)
    res.write(JSON.stringify({name:"lin"}))
    res.end()
  }else if(pathname==="/cors9"){
    res.setHeader("Content-Type","application/json")
    res.setHeader("Access-Control-Allow-Origin",nodeLunchUrl)
    res.setHeader("Access-Control-Allow-Headers","X-Token,Content-Type")
    res.setHeader("Access-Control-Allow-Methods","PUT")
    res.setHeader("Access-Control-Allow-Credentials",true)
    res.setHeader("Access-Control-Max-Age",10)
    res.setHeader("Access-Control-Expose-Headers","X-Token")
    res.setHeader("Set-Cookie","name=lin")
    res.setHeader("Access-Control-Allow-Headers","X-Token,Content-Type,Set-Cookie")
    res.write(JSON.stringify({name:"lin"}))
    res.end()
  }

  } catch (error) {
    console.log(error)
  }
}).listen(5002,()=>{
  console.log("node without express server is running at port 5002")
})