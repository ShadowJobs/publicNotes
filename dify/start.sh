#!/bin/bash

init() {

    # 在启用业务服务之前，我们需要先部署 PostgreSQL / Redis / Weaviate（如果本地没有的话），可以通过以下命令启动：
    cd docker
    cp middleware.env.example middleware.env
    # 注意！！！ ubuntu服务器要在docker-compose.middleware.yaml的 sandbox，ssrf_proxy，weaviate 的里加上 platform: linux/amd64
    docker compose -f docker-compose.middleware.yaml up -d

    # 生成随机密钥，并替换 .env 中 SECRET_KEY 的值
    cd opensource/api
    awk -v key="$(openssl rand -base64 42)" '/^SECRET_KEY=/ {sub(/=.*/, "=" key)} 1' .env > temp_env && mv temp_env .env

    poetry env use 3.11
    poetry install

    # poetry shell
    poetry run flask db upgrade

}
cd opensource/api
awk -v key="$(openssl rand -base64 42)" '/^SECRET_KEY=/ {sub(/=.*/, "=" key)} 1' .env > temp_env && mv temp_env .env

# poetry env use 3.11
poetry shell
poetry install

flask db upgrade
# init是第一次启动时的步骤，后续启动时不需要再次执行
# init

# flask run --host 0.0.0.0 --port=5001 --debug
# 后台启动flask 
# 查看已有的flask进程 ： ps -ef | grep flask 这个命令可以父子关系
nohup flask run --host 0.0.0.0 --port=5007 > output.log 2>&1 &

# 用于消费异步队列任务，如知识库文件导入、更新知识库文档等异步操作。 Linux / MacOS 启动：
# celery -A app.celery worker -P gevent -c 1 -Q dataset,generation,mail,ops_trace --loglevel INFO


cd ../web
init2() {
    npm install
    npm run build
}
# init2是第一次启动时的步骤，后续启动时不需要再次执行
init2 
nohup npm run start --port=5006 > output.log 2>&1 &