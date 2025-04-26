const express=require("express")
const jobRouter=express.Router()
const { Worker } = require('worker_threads');

jobRouter.get("/job",(req,res)=>res.send("call /job GET"))

jobRouter.post("/job",(req,res)=>res.send("call /job POST"))
jobRouter.get("/job/longtime",(req,res)=>{
    setTimeout(()=>{
        res.send({code:0,longtime:"ok"})
    },2000)
})
jobRouter.get("/job/longtime_await",async (req,res)=>{
    await new Promise(
        (resolve,reject)=>setTimeout(()=>resolve(),2000)
    )
    res.send("long promise job return")
})
jobRouter.get("/job/longtime_compute",async (req,res)=>{
    for(let i=0;i<60000;i++){
        let j=i*i
        let c=Math.sqrt(j)
        console.log(c)
    }
    res.send("long compute job return")
})
jobRouter.get("/job/lt_worker_thread",async (req,res)=>{
    const worker = new Worker(`
        const { parentPort } = require('worker_threads');
        let x=0
        for(let i=0;i<600000000;i++){
            let j=i+Math.sqrt(i);
            let c=Math.sqrt(j);
            x+=c
        }
        parentPort.postMessage('Task done'+x);
    `, { eval: true });
  
    worker.on('message', (msg) => {
        console.log(msg);  // 打印 'Task done'
        res.send("long compute job with worker thread return"+msg);
    });

    worker.on('error', (err) => {
        console.error(err);
        res.status(500).send(err.message);
    });

    worker.on('exit', (code) => {
        if (code != 0)
            console.error(`Worker stopped with exit code ${code}`);
    });
})
jobRouter.get("/job/react_query",(req,res)=>{
  setTimeout(()=>{
      res.send({code:0,data:"react query1 返回成功"})
  },1000)
})
jobRouter.get("/job/tasks_by_page",(req,res)=>{
    const page=req.query.page
    res.send({code:0,data:`page ${page} data`})
})
jobRouter.get("/job/objdata",(req,res)=>{
    res.send({code:0,data:"this is objdata"})
})
jobRouter.get("/job/bigfile",(req,res)=>{
    let s=""
    for(let i=0;i<2000000;i++){
        s+="hello "+i+Math.random()
    }
    res.send({code:0,data:s})
})


module.exports= jobRouter