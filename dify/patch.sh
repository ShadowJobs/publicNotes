#!/bin/bash

# 错误处理函数
handle_error() {
    echo "Error: $1"
    exit 1
}

# 检查目录切换是否成功
check_cd() {
    cd "$1" || handle_error "Failed to change directory to $1"
}
# 获取当前commit id
get_current_commit() {
    cd opensource && git rev-parse HEAD
}


# 创建补丁目录
create_patch_dir() {
    local commit_id=$1
    local patch_dir="patch/${commit_id}"
    mkdir -p "${patch_dir}/overwrites"
    echo "$patch_dir"
}

# 创建备份
create_backup() {
    local commit_id=$(get_current_commit)
    local timestamp=$(date +%Y%m%d%H%M%S)
    local backup_dir="backups/${commit_id}_${timestamp}"
    local patch_dir="patch/${commit_id}"
    
    # 确保patch目录存在
    if [ ! -d "$patch_dir" ]; then
        echo "No patch directory found for current commit: $commit_id"
        return 1
    fi
    
    # 创建备份
    mkdir -p "$backup_dir"
    
    # 复制现有patch和overwrites
    if [ -f "$patch_dir/update.patch" ]; then
        cp "$patch_dir/update.patch" "$backup_dir/"
    fi
    if [ -d "$patch_dir/overwrites" ]; then
        cp -r "$patch_dir/overwrites" "$backup_dir/"
    fi
    
    # 创建备份信息文件
    cat > "$backup_dir/info.txt" << EOF
Commit ID: $commit_id
Backup Date: $(date)
Branch: $(cd opensource && git branch --show-current)
EOF

    echo "Created backup in: $backup_dir"
}

# 确保在脚本所在目录执行
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

case "$1" in
    "syncgit")
        echo "Start syncing dify..."
        if [ ! -d "./opensource" ]; then
            git clone git@github.com:langgenius/dify.git ./opensource || handle_error "Failed to clone repository"
            check_cd "./opensource"
            # git checkout $DIFY_VERSION 2>/dev/null || handle_error "Failed to checkout version"
            git checkout 1fa66405c5e89acfbb031142e49ae2ffa5e67efb
            git checkout -b linying
        else
            check_cd "./opensource"
            git stash  # 保存本地修改
            # git pull || handle_error "Failed to pull updates"
            git checkout 1fa66405c5e89acfbb031142e49ae2ffa5e67efb
            if [ ! $(git branch --list linying) ]; then
                git checkout -b linying
            else
                git checkout linying
            fi
            git stash pop  # 恢复本地修改
        fi
        cd ..
        echo "Sync completed successfully"
        ;;
    
    "create")
        commit_id=$(get_current_commit)
        description="$2"
        patch_dir=$(create_patch_dir "$commit_id")
        current_dir=$(pwd)
        
        # 处理选项
        copy_new=true
        copy_ignored=false
        while [[ "$3" ]]; do
            case "$3" in
                --no-copy) copy_new=false ;;
                --copy-ignored) copy_ignored=true ;;
            esac
            shift
        done
        
        cd opensource
        
        # 创建patch文件头信息
        (
            echo "# Commit: $commit_id"
            echo "# Date: $(date)"
            echo "# Description: $description"
            git diff
        ) > "../${patch_dir}/update.patch"

        # 处理新增文件
        if [ "$copy_new" = true ]; then
            # 获取文件状态
            if [ "$copy_ignored" = true ]; then
                status_cmd="git status --porcelain --ignored"
            else
                status_cmd="git status --porcelain"
            fi
            
            $status_cmd | while read -r line; do
                status=${line:0:2}
                file=${line:3}
                
                # 检查文件状态
                case "$status" in
                    "??"|"A ") # 新文件或已暂存的新文件
                        target_dir="../${patch_dir}/overwrites"
                        if [ -d "$file" ]; then
                            # 如果是目录，递归复制
                            mkdir -p "${target_dir}/$(dirname "$file")"
                            cp -R "$file" "${target_dir}/$(dirname "$file")/"
                        else
                            # 如果是文件，确保目标目录存在，然后复制
                            mkdir -p "${target_dir}/$(dirname "$file")"
                            cp "$file" "${target_dir}/$file"
                        fi
                        echo "Copied new file/directory to overwrites: $file"
                        echo "正在清理 .pyc 文件和 __pycache__ 目录..."
                        find "../${patch_dir}/overwrites" -name "*.pyc" -type f -delete
                        find "../${patch_dir}/overwrites" -name "__pycache__" -type d -exec rm -rf {} +
                        echo "清理完成。"
                        ;;
                    "!!") # 被忽略的文件（仅当copy_ignored=true时）
                        if [ "$copy_ignored" = true ]; then
                            target_dir="../${patch_dir}/overwrites/$(dirname "$file")"
                            mkdir -p "$target_dir"
                            cp "$file" "$target_dir/"
                            echo "Copied ignored file to overwrites: $file"
                        fi
                        ;;
                esac
            done
            
            # 显式检查并复制 .env 文件
            env_files=("api/.env" "web/.env")
            for env_file in "${env_files[@]}"; do
                if [ -f "$env_file" ]; then
                    target_dir="../${patch_dir}/overwrites/$(dirname "$env_file")"
                    mkdir -p "$target_dir"
                    cp "$env_file" "$target_dir/"
                    echo "Copied .env file to overwrites: $env_file"
                fi
            done
        fi
        
        cd "$current_dir"
        
        echo "Created patch in: $patch_dir"
        if [ "$copy_new" = true ]; then
            echo "New files have been copied to: $patch_dir/overwrites/"
        fi
        ;;
    
    "apply")
        current_commit=$(get_current_commit)
        patch_dir="patch/${current_commit}"
        
        if [ ! -d "$patch_dir" ]; then
            handle_error "No patch found for current commit: $current_commit"
        fi
        
        # 创建备份
        create_backup
        
        cd opensource
        git reset --hard || handle_error "Failed to reset"
        # 应用补丁
        if [ -f "../$patch_dir/update.patch" ]; then
            git apply "../$patch_dir/update.patch" || handle_error "Failed to apply patch"
        fi
        
        # 复制overwrites文件
        if [ -d "../$patch_dir/overwrites" ]; then
            find "../$patch_dir/overwrites" -type f | while read -r file; do
                # 获取相对路径
                rel_path=${file#"../$patch_dir/overwrites/"}
                # 创建目标目录
                mkdir -p "$(dirname "$rel_path")"
                # 复制文件
                cp "$file" "$rel_path"
                echo "Copied overwrite file: $rel_path"
            done
        fi
        ;;
    
    "upload")
        # 同步文件到服务器
        rsync -avz ./patch/* root@$SERVER_IP:~/ly/running/dify/patch
ssh root@$SERVER_IP << EOF
    cd ~/ly/running/dify
    ./patch.sh apply
    cd opensource/api
    awk -v key="$(openssl rand -base64 42)" '/^SECRET_KEY=/ {sub(/=.*/, "=" key)} 1' .env > temp_env && mv temp_env .env
    cd ../..
    # cd opensource/web
    # nvm use 18
    # npm run build
    # 杀掉旧 npm run start 进程
    # pkill -f "npm run start"
    # nohup npm run start > output.log 2>&1 &
EOF
        ;;

    "syncbuild")
        # 同步文件到服务器
        # rsync -avz --exclude 'node_modules' --exclude '.next' ./opensource/web/ root@$SERVER_IP:~/ly/running/dify/opensource/web
        # 先删除远程~/ly/running/dify/opensource/web/.next文件夹
        ssh root@$SERVER_IP << EOF
            rm -rf ~/ly/running/dify/opensource/web/.next
EOF

        rsync -avz --exclude 'cache/webpack' ./opensource/web/.next root@$SERVER_IP:~/ly/running/dify/opensource/web/.next
        # 这种copy方式容易出现.next/.next的目录，注意登录服务器查看

        rsync -avz --exclude '.venv' ./opensource/api root@$SERVER_IP:~/ly/running/dify/opensource/api
        # rsync -avz ./opensource/web/* root@$SERVER_IP:~/ly/running/dify/opensource/web
ssh root@$SERVER_IP << EOF
    cd ~/ly/running/dify/opensource/web

    # 杀掉旧 npm run start 进程
    # pkill -f "npm run start"
    # npm run start --port=5006
    # nohup npm run start --port=5006 > output.log 2>&1 &
    # pm2 stop dify-web
    # pm2 start npm --name "dify-web" -- run start --port=5006
    # pm2 restart dify-web
    # 若启动失败，查看日志 pm2 logs dify-web
EOF
        ;;
        
    "restore")
        backup_dir="$2"
        if [ ! -d "backups/$backup_dir" ]; then
            handle_error "Backup directory not found: $backup_dir"
        fi
        
        # 获取commit id从备份目录名
        commit_id=$(echo "$backup_dir" | cut -d'_' -f1)
        patch_dir="patch/${commit_id}"
        
        # 创建当前状态的备份
        create_backup
        
        # 恢复patch目录
        rm -rf "$patch_dir"
        mkdir -p "$patch_dir"
        
        # 复制备份内容到patch目录
        if [ -f "backups/$backup_dir/update.patch" ]; then
            cp "backups/$backup_dir/update.patch" "$patch_dir/"
        fi
        if [ -d "backups/$backup_dir/overwrites" ]; then
            cp -r "backups/$backup_dir/overwrites" "$patch_dir/"
        fi
        
        echo "Restored patches from backup: $backup_dir"
        echo "Run 'patch.sh apply' to apply the restored patches"
        ./patch.sh apply
        ;;
        
    "list-backups")
        if [ -d "backups" ]; then
            echo "Available backups:"
            for backup in backups/*; do
                if [ -f "$backup/info.txt" ]; then
                    echo "----------------------------------------"
                    echo "Backup: $(basename "$backup")"
                    cat "$backup/info.txt"
                fi
            done
        else
            echo "No backups found"
        fi
        ;;

    "reset")
        # 重置到原始状态
        check_cd opensource
        read -p "This will reset all local changes. Continue? (y/N): " confirm
        if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
            git reset --hard || handle_error "Failed to reset"
            git clean -fd  # 清理未跟踪的文件
            echo "Reset to original state successfully"
        else
            echo "Reset aborted"
        fi
        cd ..
        ;;
    "origin")
        # 完全重置
        read -p "This will delete the entire opensource directory. Continue? (y/N): " confirm
        if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
            rm -rf opensource || handle_error "Failed to remove opensource directory"
            ./create-dify.sh || handle_error "Failed to recreate dify"
            echo "Reset completed successfully"
        else
            echo "Reset aborted"
        fi
        ;;
    "list")
        # 列出所有patch
        echo "Available patches:"
        if [ -d "patch" ]; then
            for patch in patch/*.patch; do
                if [ -f "$patch" ]; then
                    echo "----------------------------------------"
                    echo "Patch: $(basename "$patch")"
                    # 显示patch的描述（如果有）
                    head -n1 "$patch" | grep -q "^#" && head -n1 "$patch" | sed 's/^# /Description: /'
                    echo "Size: $(ls -lh "$patch" | awk '{print $5}')"
                    echo "Created: $(date -r "$patch" "+%Y-%m-%d %H:%M:%S")"
                fi
            done
        else
            echo "No patches found"
        fi
        ;;
    *)
        echo "Usage: $0 {syncgit|create|apply|origin|reset|list}"
        echo
        echo "Commands:"
        echo "  syncgit  - Sync with remote repository"
        echo "  create  - Create a new patch from current changes"
        echo "  apply    - Apply all patches"
        echo "  origin   - Reset to original state"
        echo "  reset    - Complete reset (removes opensource directory)"
        echo "  list     - List all patches"
        echo "  list-backups - List all backups"
        echo "  restore  - Restore from a backup"

        ;;
esac