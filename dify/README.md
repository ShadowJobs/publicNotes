# 补丁管理工具
文档 | [CN](https://docs.dify.ai/zh-hans/getting-started/install-self-hosted/local-source-code)


## 功能介绍
这是一个用于管理Dify项目定制修改的工具。它可以：
- 将修改内容以patch形式管理，避免将整个Dify源码纳入版本控制
- 自动识别代码修改和新增文件
- 支持按commit id管理不同版本的修改
- 提供本地备份和恢复机制

## 目录结构
```
dify/
  ├── patch.sh          # 补丁管理脚本
  ├── opensource/       # dify源码目录（由git clone获得，不纳入版本控制）
  ├── patch/           # 补丁文件目录
  │   └── <commit_id>/  # 每个commit对应的补丁目录
  │       ├── update.patch    # 修改内容的补丁文件
  │       └── overwrites/     # 新增或需要覆盖的文件
  ├── backups/         # 本地备份目录（不纳入版本控制）
  │   └── <commit_id>_<timestamp>/  # 备份时间点
  │       ├── update.patch    # 补丁文件备份
  │       └── overwrites/     # 覆盖文件备份
  └── .gitignore       # git忽略配置
```

## 补丁管理机制

### 补丁组成
每个补丁包含两部分：
1. update.patch：通过git diff生成的修改内容
2. overwrites/：需要新增或覆盖的完整文件

### 版本管理
- 每个补丁都对应特定的commit id
- patch目录下按commit id组织补丁文件
- 应用补丁时会检查当前代码库的commit id

## 使用方法

### 1. 初始化项目
```bash
git clone [你的仓库地址]
cd dify
./patch.sh syncgit    # 获取dify源码
```

### 2. 生成补丁
```bash
# 在opensource目录下修改代码
./patch.sh product "修改描述"  # 自动创建补丁并复制新文件

# 可选参数
./patch.sh product "描述" --no-copy  # 不复制新文件
./patch.sh product "描述" --copy-ignored  # 同时复制被忽略的文件
```

### 3. 应用补丁
```bash
./patch.sh apply  # 应用当前commit id对应的补丁
```

### 4. 更新代码
```bash
./patch.sh origin     # 重置到原始状态
./patch.sh syncgit    # 同步最新代码
./patch.sh apply      # 重新应用补丁
```

### 5. 备份管理
```bash
# 列出所有备份
./patch.sh list-backups

# 从备份恢复
./patch.sh restore <commit_id>_<timestamp>
./patch.sh apply  # 恢复后需要重新应用补丁
```

## 工作流程示例

### 场景一：首次设置
```bash
# 1. 克隆你的项目
git clone your-project-url
cd your-project

# 2. 获取dify源码
./patch.sh syncgit

# 3. 修改代码
cd opensource
# 进行代码修改...

# 4. 生成补丁
cd ..
./patch.sh product "首次修改"

# 5. 提交补丁到版本控制
git add patch/
git commit -m "添加dify定制补丁"
```

### 场景二：更新Dify版本
```bash
# 1. 重置到原始状态
./patch.sh origin

# 2. 更新代码
./patch.sh syncgit

# 3. 重新应用补丁
./patch.sh apply

# 4. 如果需要修改补丁
# 进行必要的代码调整...
./patch.sh product "更新补丁"
```

### 场景三：修改现有补丁
```bash
# 1. 确保在正确的版本
./patch.sh apply

# 2. 修改代码
cd opensource
# 进行代码修改...

# 3. 更新补丁
cd ..
./patch.sh product "修改补丁"
```

## 注意事项

### 1. 补丁管理
- 每次修改代码后及时生成补丁
- 补丁文件会自动包含描述信息
- 新文件会自动复制到overwrites目录

### 2. 版本控制
- opensource和backups目录不会被纳入版本控制
- 只有patch目录下的内容需要提交到git
- 每个补丁都与特定的commit id绑定

### 3. 备份恢复
- apply操作前会自动创建备份
- 备份只保存补丁文件，不包含源码
- 可以随时通过restore命令恢复之前的补丁

### 4. 最佳实践
- 及时提交patch目录的变更
- 保持补丁描述信息清晰
- 定期测试补丁的可用性
- 在更新Dify版本后及时验证补丁的兼容性

## 故障排除

### 1. 补丁应用失败
- 检查当前commit id是否匹配
- 查看是否有文件冲突
- 确认补丁文件格式正确

### 2. 文件未正确复制
- 检查overwrites目录结构
- 确认文件权限正确
- 验证目录路径正确

### 3. 版本不匹配
- 使用list-backups查看可用备份
- 尝试恢复到之前的版本
- 检查当前代码库的commit id

如需更多帮助，请查看错误信息或提交Issue。

# 启动
https://docs.dify.ai/zh-hans/getting-started/install-self-hosted/local-source-code
```shell
cd docker
cp middleware.env.example middleware.env
docker compose -f docker-compose.middleware.yaml up -d


cd api
cp .env.example .env
awk -v key="$(openssl rand -base64 42)" '/^SECRET_KEY=/ {sub(/=.*/, "=" key)} 1' .env > temp_env && mv temp_env .env

poetry env use 3.11
poetry install

poetry shell
flask db upgrade #注意这个命令，如果数据库版本不对，会报错，比如   "psycopg2.errors.UndefinedTable: relation "dify_setups" does not exist"


flask run --host 0.0.0.0 --port=5001 --debug

```

./start.sh

# 手机查看
手机查看必须是指定了具体ip的地址，我的evn修改为了localhost,导致所有api手机都无法访问 

部署问题及解决，分散在mysql+gq.md,nextjs.md,linux.md ./start.sh patch.sh等文件中