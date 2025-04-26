const express = require("express")

const streamRouter = express.Router()
streamRouter.get("/eventsource",(req,res)=>{
  res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    res.write(`data: Current time is ${new Date().toISOString()}\n\n`);
    let len=0
    const id=setInterval(() => {
      const randomStr=Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      res.write(`data: ${randomStr}\n\n`);//在 Server-Sent Events（SSE）协议中,每条消息都是由一行或多行文本构成，其中每行都以 "data: " 开头，并且以两个连续的换行符 "\n\n" 结束。
      len++;
      if(len==10){
        clearInterval(id)
        res.write(`data: close\n\n`) //后端无法主动关闭连接，所以这里发一个关闭的消息给前端，由前端关闭。如果后端直接res.end()关闭连接，那么前端会自动重连，发起新的请求，所以必须在前端关闭
        res.end()
      }
    }, 1000);
})
streamRouter.get("/gpt-stream", (req, res) => {
  res.setHeader('Content-Type', 'application/octet-stream'); //设置为流，可以逐个发送
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Transfer-Encoding', 'chunked');
  res.flushHeaders(); // 发送头信息
  let i = 0;
  let intervalId = setInterval(() => {
      i++;
      res.write(`xxxxx ${i}`);
      if (i >= 10) {
          clearInterval(intervalId);
          res.end();
      }
  }, 1000);
});

module.exports = streamRouter