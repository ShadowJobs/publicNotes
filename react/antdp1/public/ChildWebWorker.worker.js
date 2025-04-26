importScripts('WorkerUtil.js'); //注意加载其他文件，必须用imporScripts，可以一次输入多个文件作为参数

self.addEventListener('message', (e) => {
  console.log(e.data);
  let result=bigJob()
  // Post the result back to main thread
  self.postMessage(result);
  //子线程关闭用self.close()
});
