# 1. 环境和命令,VSCode
1. vscode安装命令行：command+shift+p,然后输入install code，选第一个，就会在本机安装code命令，code proj1 会用vscode打开proj目录

2. pip freeze > requirements.txt
将当前环境生成到requirements.txt
pip install -r requirements.txt

3. python -m venv openai-env  创建虚拟环境，执行后，python命令会从openai-env文件夹里找到python来执行，pip也是在这个文件夹里，并且安装到这个文件夹，类似与node_modules
使用venv环境source openai-env/bin/activate

4. .vscode/launnch.json配置flask启动示例：
```json
{
    "version": "0.2.0",
    "compounds": [
        {
            "name": "Launch Flask and Celery",
            "configurations": ["Python: Flask", "Python: Celery"]
        }
    ],
    "configurations": [
        {
            "name": "Python: Flask",
            "consoleName": "Flask",
            "type": "debugpy",
            "request": "launch",
            "python": "${workspaceFolder}/.venv/bin/python",
            "cwd": "${workspaceFolder}",
            "envFile": ".env",
            "module": "flask",
            "justMyCode": true,
            "jinja": true,
            "env": {
                "FLASK_APP": "app.py",
                "GEVENT_SUPPORT": "True"
            },
            "args": [
                "run",
                "--port=5021"
            ]
        },
        {
            "name": "Python: Celery",
            "consoleName": "Celery",
            "type": "debugpy",
            "request": "launch",
            "python": "${workspaceFolder}/.venv/bin/python",
            "cwd": "${workspaceFolder}",
            "module": "celery",
            "justMyCode": true,
            "envFile": ".env",
            "console": "integratedTerminal",
            "env": {
                "FLASK_APP": "app.py",
                "FLASK_DEBUG": "1",
                "GEVENT_SUPPORT": "True"
            },
            "args": [
                "-A",
                "app.celery",
                "worker",
                "-P",
                "gevent",
                "-c",
                "1",
                "--loglevel",
                "DEBUG",
                "-Q",
                "dataset,generation,mail,ops_trace,app_deletion"
            ]
        }
    ]
}

```

# 2. poetry
  [poetry 1.8.5 -> 2.0.1升级注意](/docs/dify升级注意.md)

  poetry 比 pip 提供了更好的包管理功能。主要区别如下:

  ### 1. poetry install 的特点:
  ```bash
  # 安装项目所有依赖
  poetry install
  # 只安装主依赖,不含开发依赖
  poetry install --no-dev
  ```

  ### 2. poetry 相比 pip 的优势:
  - 依赖解析更智能,能更好地处理包之间的依赖关系
  - 使用 poetry.lock 文件锁定依赖版本,确保环境一致性  
  - 自动创建和管理虚拟环境
  - 可以分别管理主依赖和开发依赖
  - 提供更多包管理相关命令

  ### 3. 项目结构:
  ```
  my_project/
  ├── pyproject.toml    # 项目依赖配置文件 , 对标 requirements.txt
  ├── poetry.lock       # 依赖版本锁定文件  
  ├── src/             # 源代码
  └── tests/           # 测试代码
  ```
  ### 4. 常用poetry命令:

  1. 项目初始化和创建
  ```bash
  # 创建新项目
  poetry new project-name

  # 在现有项目中初始化
  poetry init

  # 注意这里用了 poetry shell, 就不用python -m venv venv了，poetry自己有自己的虚拟环境. 2.0里没有这个命令
  poetry shell
  进入后，exit退出

  # 退出虚拟环境
  exit
  ```

  2. 依赖管理
  ```bash
  # 安装所有依赖
  poetry install

  # 只安装主依赖（不含开发依赖）
  poetry install --no-dev

  # 添加依赖
  poetry add package-name
  poetry add package-name==1.2.3  # 指定版本
  poetry add "package-name>=1.2.3" # 版本范围
  poetry add package-name --dev    # 添加开发依赖

  # 移除依赖
  poetry remove package-name

  # 更新依赖
  poetry update          # 更新所有依赖
  poetry update package-name  # 更新特定包
  ```

  3. 包管理和查看
  ```bash
  # 显示所有已安装的包
  poetry show

  # 显示已安装包的详细信息
  poetry show package-name

  # 显示过期的包
  poetry show --outdated

  # 查看依赖树
  poetry show --tree
  ```

  4. 项目运行和构建
  ```bash
  # 运行命令
  poetry run python script.py
  poetry run pytest

  # 构建项目
  poetry build

  # 发布到 PyPI
  poetry publish
  ```

  5. 环境管理
  ```bash
  # 显示虚拟环境信息
  poetry env info

  # 列出所有虚拟环境
  poetry env list

  # 删除虚拟环境
  poetry env remove python3.8

  # 使用指定 Python 版本创建环境
  poetry env use python3.8
  ```

  6. 配置管理
  ```bash
  # 显示配置
  poetry config --list

  # 设置配置
  poetry config virtualenvs.create false  # 禁用自动创建虚拟环境

  # 本地配置
  poetry config virtualenvs.in-project true --local  # 在项目目录创建虚拟环境
  ```

  7. 锁文件和依赖解析
  ```bash
  # 更新 poetry.lock
  poetry lock

  # 检查依赖是否一致
  poetry check
  ```

  8. 缓存管理
  ```bash
  # 清理缓存
  poetry cache clear . --all
  poetry cache clear pypi --all
  ```

  9. 常用组合命令示例：
  ```bash
  # 创建新项目并安装依赖
  poetry new myproject
  cd myproject
  poetry install

  # 运行测试
  poetry run pytest

  # 构建和发布
  poetry build
  poetry publish
  ```

  10. 实用技巧：
  ```bash
  # 导出 requirements.txt
  poetry export -f requirements.txt --output requirements.txt

  # 包含开发依赖
  poetry export -f requirements.txt --output requirements.txt --dev

  # 指定 Python 版本
  poetry env use python3.8

  # 查看包的详细信息
  poetry show -v package-name
  ```

  注意事项：
  1. 建议将 `pyproject.toml` 和 `poetry.lock` 文件提交到版本控制
  2. 在团队项目中统一使用相同的 Poetry 版本
  3. 建议在项目目录下创建虚拟环境

  配置建议：
  ```toml
  # pyproject.toml 示例
  [tool.poetry]
  name = "project-name"
  version = "0.1.0"
  description = ""
  authors = ["Your Name <your@email.com>"]

  [tool.poetry.dependencies]
  python = "^3.8"
  fastapi = "^0.68.0"

  [tool.poetry.dev-dependencies]
  pytest = "^6.2.5"
  black = "^21.7b0"

  [build-system]
  requires = ["poetry-core>=1.0.0"]
  build-backend = "poetry.core.masonry.api"
  ```

  ### 5. 已经用了python venv项目的，如何改用poetry
  ```bash
  # 1. 退出当前虚拟环境
  deactivate
  # 2. 删除现有的 venv 目录
  rm -rf venv
  # 3. 让 poetry 重新创建虚拟环境并安装依赖
  poetry env remove --all
  poetry install
  # 4. 进入新的虚拟环境
  poetry shell
  ```

  ### 6. ubuntu 安装 poetry 的坑
  mac上默认安装poetry是1.8.5，ubuntu上默认是2.0.1，导致poetry shell命令找不到，必须降级
  ```bash
  pip install --user --upgrade "poetry==1.8.5"
  ```


# 3. 技巧和方法
查看包的安装位置
python -c "import pydantic_settings; print(pydantic_settings.__file__)"

# 4. flask 
dify的启动为 flask run --host 0.0.0.0 --port=5021 --debug

这样的启动命令，flask是如何找到入口文件的？
1) 先看环境变量FLASK_APP是否有设置,这个最优先
2) 如果没设置环境变量,就会按默认顺序找:
- wsgi.py
- app.py
- application.py
- 最后是当前目录下任何包含 create_app 或 app 变量的py文件

这个命令参数里设置了host和port,但没有指定入口文件...所以肯定是按默认顺序找的。

不过有--debug参数,这说明是开发模式。在开发模式下更常用app.py作为入口。
## 4.1 flask db upgrade
`flask db upgrade` 命令是 Flask 应用中进行数据库迁移的关键工具。它的主要功能和重要性如下：

1. 应用数据库迁移：
   - 这个命令会执行所有未应用的数据库迁移脚本。
   - 它更新数据库结构以匹配应用程序的最新模型定义。

2. 自动化数据库更新：
   - 它会自动检测哪些迁移脚本需要运行，并按正确的顺序执行它们。
   - 这确保了数据库结构与应用代码保持同步。

3. 版本控制：
   - 命令会更新数据库中的版本信息，记录当前应用的迁移版本。
   - 这有助于跟踪数据库结构的变化历史。

4. 创建表和结构：
   - 在您的情况下，它可能创建了 'dify_setups' 表以及其他必要的表和结构。

5. 安全和一致性：
   - 迁移通常在事务中执行，确保数据库更改的一致性。
   - 它是幂等的，多次运行不会导致问题。

6. 跨环境同步：
   - 帮助在不同环境（开发、测试、生产）之间保持数据库结构的一致性。