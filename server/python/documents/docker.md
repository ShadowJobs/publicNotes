# 1. ubuntu 安装 docker 
官方安装方法：https://docs.docker.com/engine/install/ubuntu/#install-using-the-repository 

不能直接apt命令安装，有奇怪的问题， 要跟随官方文档安装。(若装了旧的要根据官方文档卸载旧的)

唯一的问题是官方文档的命令会出现如下错误，也就是国内不能访问官方的源，需要使用国内源。

sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
curl: (35) OpenSSL SSL_connect: Connection reset by peer in connection to download.docker.com:443
这个错误表明 SSL 连接被重置，通常是网络或 SSL/证书问题。以下是几种解决方案：

1. 使用国内镜像源：
```bash
# 阿里云镜像
sudo curl -fsSL https://mirrors.aliyun.com/docker-ce/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc

# 或者使用清华镜像
sudo curl -fsSL https://mirrors.tuna.tsinghua.edu.cn/docker-ce/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
```

2. 如果使用代理，检查代理设置：
```bash
# 设置代理
export http_proxy="http://proxy.example.com:port"
export https_proxy="http://proxy.example.com:port"

# 或者直接在 curl 命令中使用代理
sudo curl -x proxy.example.com:port -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
```

# 2. 配置文件，设置docker源
```bash
# 创建或编辑 daemon.json 文件
ubuntu：
sudo mkdir -p /etc/docker
sudo vi /etc/docker/daemon.json

mac： /Users/username/.docker/daemon.json
{
  "registry-mirrors": [
    "https://mirror.ccs.tencentyun.com",
    "https://docker.mirrors.ustc.edu.cn",
    "https://registry.docker-cn.com",
    "https://dockerhub.azk8s.cn",
    "https://hub-mirror.c.163.com",

    "https://docker.211678.top",
    "https://docker.1panel.live",
    "https://hub.rat.dev",
    "https://docker.m.daocloud.io",
    "https://do.nark.eu.org",
    "https://dockerpull.com",
    "https://dockerproxy.cn",
    "https://docker.awsl9527.cn",
    "https://dockerproxy.net/"

    "https://7hi2o5wy.mirror.aliyuncs.com",
    "https://docker.registry.cyou",
    "https://docker-cf.registry.cyou",
    "https://dockercf.jsdelivr.fyi",
    "https://docker.jsdelivr.fyi",
    "https://dockertest.jsdelivr.fyi",
    "https://mirror.aliyuncs.com",
    "https://dockerproxy.com",
    "https://mirror.baidubce.com",
    "https://docker.nju.edu.cn",
    "https://docker.mirrors.sjtug.sjtu.edu.cn",
    "https://mirror.iscas.ac.cn"
  ]
}

# 重启 Docker 服务
sudo systemctl daemon-reload
sudo systemctl restart docker

# 验证配置是否生效
docker info
```

# 3. docker-compose
docker compose -f docker-compose.middleware.yaml up -d

在 docker-compose.yaml 文件所在目录执行
docker compose -f docker-compose.middleware.yaml down
有几种方式可以停止使用 docker-compose 启动的服务，我来详细说明：

1. 使用 docker-compose down 命令（推荐）
```bash
# 在 docker-compose.yaml 文件所在目录执行
docker compose -f docker-compose.middleware.yaml down
# 该命令会：
# - 停止所有容器
# - 删除所有容器
# - 删除默认网络
# 但不会删除卷（volumes）
```

2. 如果只想停止但不删除容器
```bash
# 停止服务但保留容器
docker compose -f docker-compose.middleware.yaml stop
# 如果上面的命令报错，可以使用以下命令
docker stop $(docker ps -q)
```

3. 使用 docker-compose 其他相关命令
```bash
# 暂停服务（不是停止）
docker compose -f docker-compose.middleware.yaml pause

# 恢复已暂停的服务
docker compose -f docker-compose.middleware.yaml unpause

# 停止单个服务
docker compose -f docker-compose.middleware.yaml stop [服务名]

# 启动单个服务
docker compose -f docker-compose.middleware.yaml start [服务名]
```

4. 如果忘记了配置文件位置，可以通过以下步骤：
```bash
# 1. 查看运行中的容器
docker ps

# 3. 使用 docker inspect 查看容器详细信息
docker inspect [容器ID或名称]

```

5. 强制停止（不推荐，除非必要）
```bash
# 强制停止所有容器
docker kill $(docker ps -q)
# 或者停止指定容器
docker kill [容器ID或名称]
```

3. 环境清理
```bash
# 删除所有停止的容器
docker container prune
# 删除所有未使用的网络
docker network prune
# 删除所有未使用的卷
docker volume prune
# 一次性清理所有未使用的 docker 资源
docker system prune
```

4. 注意事项：
- 使用 `down` 命令会删除容器和网络，但默认保留卷
- 如果需要保留数据，不要使用 `-v` 参数
- 在生产环境中要谨慎使用 `kill` 命令
- 确保在正确的目录下执行命令
- 注意检查是否有其他服务依赖正在运行的容器

5. 问题排查：
```bash
# 查看服务日志
docker compose -f docker-compose.middleware.yaml logs
# 查看服务状态
docker compose -f docker-compose.middleware.yaml ps
# 查看服务配置
docker compose -f docker-compose.middleware.yaml config
```

查看命令的帮助文档：
```bash
docker compose --help
docker compose down --help
```

# 4. 服务启停
```bash
# ubuntu 20.04
sudo systemctl start docker
sudo systemctl stop docker
sudo systemctl restart docker
sudo systemctl status docker
#mac 可以直接用Docker Desktop
brew services start docker
brew services stop docker
```

错误： 
Jan 07 11:10:28 hcss-ecs-fed8 systemd[1]: docker.service: Start request repeated too quickly.
Jan 07 11:10:28 hcss-ecs-fed8 systemd[1]: docker.service: Failed with result 'exit-code'.
Jan 07 11:10:28 hcss-ecs-fed8 systemd[1]: Failed to start Docker Application Container Engine.
这种情况通常有几种可能原因:
1. Docker守护进程配置问题
2. Docker依赖的系统服务异常
3. Docker数据目录权限问题 
4. 系统资源不足
5. Docker配置文件损坏. **我的情况是第5种，daemon.json的registry-mirrors配置没有写https://头**

# 5. 架构不兼容问题

uname -m 可以查看linux的cpu架构，

查docker 镜像的架构用命令：
docker run --rm <image_name_or_id> uname -m， 
或者 docker run --rm <image_name> cat /etc/os-release

查看镜像支持的架构
docker manifest inspect langgenius/dify-sandbox:0.2.10

如果两者不一样，启动会失败，会一时restarting , 此时，如果是compose.yaml启动,那么在所在的服务里加上 platform: linux/amd64 （服务器的cpu）即可，如果是命令启动，则
执行  docker run --platform linux/amd64 <image_name> 即可



mac上的uname是arm64,ubuntu的是x86_64,这样mac通过docker save下来的image在ubuntu上运行会导致架构不匹配，
具体表现不是docker无法启动，而是node在连接docker compose里的redis服务时报错：

start listen video chat ,port39001
undefined
node without express server is running at port 5002
Something went wrong AggregateError

并且普通的redis-cli连接也失败，无法连接redis-cli
Could not connect to Redis at 127.0.0.1:6379: Connection refused

# 6. 如何查看image的内容
  有几种方法，每种方法都有其优缺点：

  1. 使用docker inspect命令：
    - 优点：不需要运行容器，可以直接查看镜像信息
    - 缺点：信息可能不完整，取决于镜像制作者提供的元数据

  2. 运行容器并在内部执行命令：
    - 优点：最准确，可以直接查看系统文件
    - 缺点：需要运行容器，可能有安全隐患

  3. 查看Dockerfile：
    - 优点：可以了解镜像的构建过程
    - 缺点：不是所有镜像都有公开的Dockerfile

  4. 使用docker history命令：
    - 优点：可以查看镜像的构建历史
    - 缺点：信息可能不完整或难以解读

  5. 使用专门的工具如Dive：
    - 优点：提供更详细的镜像分析
    - 缺点：需要额外安装工具

  6. docker run --rm <image_name_or_id> cat /etc/os-release
  这个命令会显示详细的操作系统信息，包括Ubuntu的版本。

  如果镜像非常精简，可能没有常见的版本信息文件。在这种情况下，您可以尝试查看 /etc/issue 文件：
  docker run --rm <image_name_or_id> cat /etc/issue



# 7. mac docker清理
先安装 OmniDiskSweeper 查看文件夹大小
```bash
查看Docker当前磁盘使用情况
  docker system df
  #删除未使用的容器
  docker container prune

### 删除悬空(dangling)镜像
docker image prune
### 删除所有未使用的镜像(包括未被任何容器使用的镜像)
docker image prune -a
### 删除未使用的卷
docker volume prune
### 删除未使用的网络
docker network prune
### 一键清理所有未使用的Docker资源
docker system prune
如果要包括未使用的卷:
docker system prune --volumes
```

## 3. Docker Desktop特定设置

### 在Docker Desktop中配置磁盘映像大小限制

1. 打开Docker Desktop
2. 点击右上角的齿轮图标(设置)
3. 选择"Resources"(资源)选项
4. 在"Disk image size"部分，可以设置磁盘映像的最大大小
5. 调整完成后点击"Apply & Restart"

### 重置Docker Desktop

如果问题严重，可以考虑重置Docker:
1. 在Docker Desktop中，进入Troubleshoot(故障排除)
2. 选择"Clean / Purge data"
3. 点击"Reset to factory defaults"

## 4. 删除构建缓存

构建缓存可能占用大量空间:
```
docker builder prune
```

## 5. 压缩Docker Desktop磁盘映像(macOS/Windows)

在macOS上，Docker使用一个磁盘映像存储所有数据。即使删除了内部资源，这个映像文件也不会自动收缩。重置Docker Desktop可以解决这个问题。

## 6. 限制和清理容器日志

大型应用的日志可能会占用大量空间。可以在docker-compose.yml或运行容器时设置日志限制:

```yaml
services:
  service-name:
    logging:
      options:
        max-size: "10m"
        max-file: "3"
```

## 提示

- 定期运行`docker system prune`可以保持Docker空间使用在合理范围内
- 使用多阶段构建创建更小的镜像
- 考虑使用Alpine基础镜像减小镜像体积
- 在Dockerfile中减少层数和不必要的文件复制

这些方法应该能有效减少Docker Desktop占用的空间。请注意，删除操作是不可恢复的，请确保不要删除重要的数据或正在使用的资源。