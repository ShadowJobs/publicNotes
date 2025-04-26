# 2025-01-24 ,版本变化 1fa66405c5e89acfbb031142e49ae2ffa5e67efb -> da67916843249390ee75438207042b215e752183
  - 升级前注意，保存 api/storage/privkeys文件夹，因为这个文件夹里面存放了加密的私钥，rsync命令可能导致丢失
  - 升级 poetry 1.8.5 -> 2.0.1.
    ```bash
      # mac: 
      # 如果已经在poetry虚拟环境中，需要退出
      exit
      pip uninstall poetry 
      pip install poetry
      # 激活， poetry shell， Mac 新版本已经没有了 
      source .venv/bin/activate
      # .toml有变化，需要重新安装
      poetry install
      cp .env.lin.server .env
      # ubuntu:
    ```

  - docker: 
  ```bash
    #更新后，重新copy env配置
    cp .env.example .env
    cp middleware.env.example middleware.env 
    docker-compose -f docker-compose.middleware.yaml stop
    # 如果停不掉， 用： 
    docker stop $(docker ps -q)
  # 报错 /middleware.env not found, 只需复制一份middleware.env.example到middleware.env即可
  # 注意更新后如果docker-compose.middleware.yaml有变化，一定要注意要在sandbox等服务下加 platform: linux/amd64
    docker compose -f docker-compose.middleware.yaml up -d
    
  ```

  - 启动
  ```bash
    cd api
    source .venv/bin/activate
    flask db upgrade
    flask run --host 0.0.0.0 --port=5007 --debug

    cd web 
    npm install
    npm run dev
  ```

  - 问题：
    1. 本地数据都丢失了，postgresql里accounts没有了
    原因：可能是因为开始用公司的库，启动的是postgres:15-alpine, 后来重启的时候，用了postgres:15。

    2. 更新后报错file not found , privete key not found。 表现是模型列表里没有模型
        raise PrivkeyNotFoundError("Private key not found, tenant_id: {tenant_id}".format(tenant_id=tenant_id))
        libs.rsa.PrivkeyNotFoundError: Private key not found, tenant_id: 6d700908-04d4-41cd-b540-3e072b04e63c

        该错误可能是由于更换了部署方式，或者 api/storage/privkeys 删除导致，这个文件是用来加密大模型密钥的，因此丢失后不可逆。可以使用如下命令进行重置加密公私钥：
        解决：https://docs.dify.ai/zh-hans/learn-more/faq/install-faq#id-2.-ben-di-bu-shu-ri-zhi-zhong-bao-file-not-found-cuo-wu-ru-he-jie-jue
        执行 flask reset-encrypt-key-pair