#!/bin/bash
# 注意，解决服务器上无法连接docker的问题，在本地pull镜像，然后传输到服务器，再在服务器上load镜像，但是这种方法必须要求连个机器的架构相同，也就是uname的值相同
# 我的mac uname是arm，而服务器是x86_64，所以这种方法行不通。
# 还是得用代理的方式。
source ~/.zshrc

# rsync -avz . root@$SERVER_IP:~/ly/running/dify
# rsync -avz ./patch/ root@$SERVER_IP:~/ly/running/dify/patch

cd opensource/docker
YAML_FILE="docker-compose.middleware.yaml"
LOG_FILE="/tmp/transfer_images.log"

TEMP_DIR="/tmp/linying_docker"

# 错误处理
set -e
trap 'cleanup' ERR EXIT

# 日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

# 清理函数
cleanup() {
    log "Cleaning up..."
    # 清理本地临时目录
    if [ -d "$TEMP_DIR" ]; then
        rm -rf "$TEMP_DIR"
    fi
    
    # 清理服务器临时目录
ssh root@$SERVER_IP << EOF
    if [ -d "$TEMP_DIR" ]; then
      rm -rf "$TEMP_DIR"
    fi
EOF
}

# 检查镜像是否已存在于服务器
check_image_exists() {
    local image=$1
    ssh root@$SERVER_IP "docker images -q $image" | grep -q .
    return $?
}

# 创建新的日志文件
echo "" > $LOG_FILE

# 清理旧的临时目录
cleanup

# 创建临时目录
log "Creating temporary directory..."
mkdir -p $TEMP_DIR

# 提取镜像名称
log "Extracting image names from yaml file..."
IMAGES=$(grep "image:" $YAML_FILE | awk '{print $2}')

# 如何定义数组：
# IMAGES=("redis:6-alpine")
# echo "Images found: ${IMAGES[0]}"
# exit 1


# 确保提取到了镜像
if [ -z "$IMAGES" ]; then
    log "Error: No images found in $YAML_FILE"
    exit 1
fi

# 本地处理镜像
for IMAGE in $IMAGES; do
    log "Processing image: $IMAGE"
    
    # 检查服务器上是否已有该镜像
    if check_image_exists $IMAGE; then
        log "Image $IMAGE already exists on server, skipping..."
        continue
    fi
    
    # 检查本地是否已有镜像
    if [ -z "$(docker images -q $IMAGE 2>/dev/null)" ]; then
        log "Pulling image $IMAGE..."
        docker pull $IMAGE || {
            log "Error: Failed to pull image $IMAGE"
            continue
        }
    else
        log "Image $IMAGE already exists locally"
    fi
    
    # 保存镜像
    log "Saving image to tar..."
    FILENAME=$(echo $IMAGE | tr '/:' '_').tar
    docker save $IMAGE > "$TEMP_DIR/$FILENAME"
done

# 检查是否有文件需要传输
if [ -z "$(ls -A $TEMP_DIR)" ]; then
    log "No images need to be transferred"
    exit 0
fi

# 在服务器上创建目录
log "Creating directory on server..."
ssh root@$SERVER_IP "mkdir -p $TEMP_DIR"

# 传输文件到服务器
log "Transferring files to server..."
for FILE in $TEMP_DIR/*.tar; do
    if [ -f "$FILE" ]; then
        log "Transferring $FILE..."
        rsync -P $FILE root@$SERVER_IP:$TEMP_DIR/ || {
            log "Error: Failed to transfer $FILE"
            continue
        }
    fi
done

# 在服务器上加载镜像
log "Loading images on server..."
ssh root@$SERVER_IP << EOF
    cd $TEMP_DIR
    for file in *.tar; do
        if [ -f "\$file" ]; then
            echo "Loading \$file..."
            docker load < "\$file" || echo "Failed to load \$file"
            rm "\$file"
        fi
    done
    cd ..
    rmdir $TEMP_DIR 2>/dev/null || true
    docker images
EOF

log "Operation completed successfully!"
