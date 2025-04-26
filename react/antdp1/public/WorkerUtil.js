
var bigJob=(e) => {
  const startTime = Date.now();
  let result = 0;
  while (Date.now() - startTime < 3000) { //一个3秒的任务
    result += Math.random();
  }
  console.log("big job complete");
  return result
}
