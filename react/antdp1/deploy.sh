#!/bin/bash
source ~/.zshrc
# 不执行source，有些命令会找不到，nvm
# set -e ： 遇到错误后立即停止，否则后续的代码依旧会执行
set -e

# Uncomment publicPath in config.ts
# 在 MacOS 上，sed -i 命令需要一个额外的参数用于备份。你可以通过提供一个空字符串来解决这个问题，例如 sed -i '' 's/foo/bar/g' filename
# sed -i '' "s/\/\/ publicPath: '\/ly\/',/publicPath: '\/ly\/',/" ./config/config.ts
nvm use 16 && npm run build
# sed -i '' "s/publicPath: '\/ly\/',/\/\/ publicPath: '\/ly\/',/" ./config/config.ts

# 方法1：rm + scp太慢了，改用rsync
# ssh root@$SERVER_IP "rm -rf ~/ly/running/antdp1"
# scp -r ./dist/ root@$SERVER_IP:~/ly/running/antdp1 

# 方法2
rsync -avz ./dist/ root@$SERVER_IP:~/ly/running/antdp1

# exit 0
# build react1
cd ../react1
# pnpm install
pnpm build
rsync -avz ./build/ root@$SERVER_IP:~/ly/running/qiankun-react1

cd ../vitereact
emcc src/cpp/helloWorld.cpp src/cpp/math.cpp -o public/helloWorld.js -s EXPORTED_FUNCTIONS='["_main", "_add"]' -s MODULARIZE=1 -s 'EXPORT_NAME="createModule"'

build_project() {
    local project=$1
    local build_dir=$2
    local dest_dir=$3

    echo "开始构建 $project..."
    cd "$build_dir"
    # pnpm install
    pnpm build
    rm -rf "$dest_dir"
    rsync -avz ./dist/ "root@$SERVER_IP:$dest_dir"
    echo "$project 构建完成"
}

# 并行执行2个构建过程
build_project "vitereact" "../vitereact" "~/ly/running/vitereact" &
build_project "vue3" "../vues/myvue-vue3" "~/ly/running/qiankun-vue3" &

# 等待所有后台作业完成
wait

# cp -r ./conf/server.conf root@$SERVER_IP:/etc/nginx/conf.d/main.conf
# nginx -s reload
echo "Deployment completed."
