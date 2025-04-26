#!/bin/bash
# set -e ： 遇到错误后立即停止，否则后续的代码依旧会执行
set -e

use_scp=2
# Uncomment publicPath in config.ts
# 在 MacOS 上，sed -i 命令需要一个额外的参数用于备份。你可以通过提供一个空字符串来解决这个问题，例如 sed -i '' 's/foo/bar/g' filename
if [ $use_scp -eq 1 ]
then
echo 1
    # ssh root@$SERVER_IP "rm -rf ~/ly/running/express" # 删除方法1：直接删除整个文件，会导致node_modules文件夹也被删除
    # 删除方法2，先拷贝整个文件夹到temp，再scp或者rsync，再将temp的内容拷贝回去，最后删除temp
ssh root@$SERVER_IP << EOF
    rm -rf ~/temp
    mkdir ~/temp
    mv ~/ly/running/express/node_modules ~/temp/
    # mv ~/ly/running/express/.node-persist ~/temp/
    rm -rf ~/ly/running/express
EOF
scp -r ./ root@$SERVER_IP:~/ly/running/express  #scp不支持忽略，使用rsync代替
# rsync参数解释
# -a 表示"archive"模式，保留源文件的权限、时间戳等信息。
# -v 表示"verbose"模式，显示更多详细的信息。
# -z 表示启用压缩，可以加速传输速度。

# 杀掉可能存在的 node 进程, 并启动新的 node 进程
ssh root@$SERVER_IP << EOF
    mv ~/temp/* ~/ly/running/express/
    rmdir ~/temp
    pkill -f "node app.js"  # 杀死所有包含node app.js的进程
    pkill -f "python3 main.py"  # 杀死所有包含python3 main.py的进程
    cd ~/ly/running/express
    nohup node app.js > output.log 2>&1 & # nohup使得命令在后台以持续运行的方式执行；> output.log 2>&1表示将标准输出（stdout）和错误输出（stderr）都重定向到output.log文件中；末尾的&表示将该命令放入后台运行。
EOF




else
ssh root@$SERVER_IP << EOF
    echo "rm old express and python files"
    # rm -rf ~/ly/running/express
    # rm -rf ~/ly/running/python
EOF
    rsync -avz --exclude 'node_modules' --exclude '.node-persist' --exclude '*.rdb' --exclude "*.mp4" ./ root@$SERVER_IP:~/ly/running/express
    rsync -avz --exclude 'venv' --exclude 'uploades' ../python/* root@$SERVER_IP:~/ly/running/python/
ssh root@$SERVER_IP << EOF
    pkill -f "node app.js"  # 杀死所有包含node app.js的进程
    cd ~/ly/running/express
    echo "npm i"
    # npm i --legacy-peer-deps
    # nohup node app.js --prod > output.log 2>&1 & # nohup使得命令在后台以持续运行的方式执行；> output.log 2>&1表示将标准输出（stdout）和错误输出（stderr）都重定向到output.log文件中；末尾的&表示将该命令放入后台运行。
    pm2 start app.js --name "myapp" -- --prod
    cd ../python
    pip3 install -r requirements.txt
    pkill -f "python3 main.py"
    nohup python3 main.py > pyout.log 2>&1 &
EOF
fi

echo "Deployment completed."