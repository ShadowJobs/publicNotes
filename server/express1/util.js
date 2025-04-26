const fs=require('fs')
const path = require('path')
const {promisify} = require("util")//工具：将异步方法转为promise的方法
const readFile=promisify(fs.readFile) 

const jsonPath=path.join(__dirname,'./jsonTest/json1.json')
exports.getJsonData=async()=>{
  const data=await readFile(jsonPath,'utf-8')
  return JSON.parse(data)
}