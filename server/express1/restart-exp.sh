
pkill -f "node app.js"  # 杀死所有包含node app.js的进程
cd ~/ly/running/express
echo "npm i"
npm i --legacy-peer-deps
nohup node app.js > output.log 2>&1 & # nohup使得命令在后台以持续运行的方式执行；> output.log 2>&1表示将标准输出（stdout）和错误输出（stderr）都重定向到output.log文件中；末尾的&表示将该命令放入后台运行。
echo "Deployment completed."