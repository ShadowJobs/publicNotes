# 1. copy table: 
```sql
create table a copy b;
create table a select * from b;
create table a select id,name from b where 0;仅仅复制b表的结构，不复制数组
```

# 2. timestamp比datetime占用的空间小。
timestamp只能表示1970以后的数。且表示当前服务器的时区的时间。datetime表示1000-9999年的数

show variables like 'time_zone'；获取当前数据库时区

set time_zone='+9:00'更改时区。此时再取数，timestamp类型的数取出来的值就跟datetime不一样了。

# 3. 踩大坑：mysql突然无法启动
踩坑记录：某一天python代码无法启动，显示数据库连接失败。

- 查看mysql状态：brew services list，显示mysql为stopped
- 执行 brew services start mysql，显示Bootstrap failed: 5: Input/output error
Try re-running the command as root for richer errors.
Error: Failure while executing; `/bin/launchctl bootstrap gui/501 /Users/linying/Library/LaunchAgents/homebrew.mxcl.mysq
表示权限不够，执行sudo brew services start mysql，显示Bootstrap failed: 5: Input/output error
- 查看端口占用：lsof -i:3306，显示没有占用
- 手动启动，执行 mysql.server start，显示Starting MySQL
. ERROR! The server quit without updating PID file (/opt/homebrew/var/mysql/linyingMac.local.pid).
查这个pid文件，发现不存在。这个信息很关键：这通常表明MySQL在启动过程中遇到了问题就立即退出了。
- 尝试不使用任何配置文件启动MySQL服务，以确定是否是配置问题导致的。mysqld_safe --skip-grant-tables &
显示成功, 但是状态仍然是stopped
- mysql -u root -p
ERROR 2002 (HY000): Can't connect to local MySQL server through socket '/tmp/mysql.sock' (2)

  socket文件的作用：
  它是MySQL服务器用于本地连接的一个通信端点,当应用程序要在同一台机器上连接MySQL时,使用socket通信会比TCP/IP更快
  ,这个文件在MySQL服务启动时会自动创建,服务停止时会自动删除,找不到这个文件通常意味着MySQL服务没有正常运行.
  所以不是什么有用信息
- 先stop再start, brew services stop mysql, brew services start mysql,此时不报错了，都显示【成功】，但是brew list显示状态仍然是stopped
- 既然前面可能是权限不够，那么尝试 sudo brew services start mysql ，仍然是stopped
- 查日志： tail -n 100 /opt/homebrew/var/mysql/linyingMac.local.err
  有内容”2025-01-02T08:54:57.177456Z 0 [ERROR] [MY-010123] [Server] Fatal error: Please read "Security" section of the manual to find out how to run mysqld as root!”
  
  表明 MySQL 服务器尝试以 root 用户身份运行，但 MySQL 不允许以 root 用户身份运行。于是不用sudo，但是又变成了原来的错误
- 尝试修改权限： sudo chown -R $(whoami) /opt/homebrew/var/mysql/，不起作用
- 重启mac，不起作用
- 检查~/Library/LaunchAgents/homebrew.mxcl.mysql.plist,这个文件在brew services start mysql,会创建，stop时会删除。但是状态仍然是stopped。没有发现文件有何异常
- 尝试重新加载系统的LaunchAgents： launchctl unload ~/Library/LaunchAgents/homebrew.mxcl.mysql.plist
launchctl load ~/Library/LaunchAgents/homebrew.mxcl.mysql.plist
还是不起作用
- brew services list显示mysql的User是root，而当前用户是linying，于是尝试修改User为linying，

  执行sudo chown -R $(whoami) /opt/homebrew/var/mysql
  sudo chown $(whoami) ~/Library/LaunchAgents/homebrew.mxcl.mysql.plist

  发现无法修改，还是显示为root
- 再次查日志： tail -n 50 /opt/homebrew/var/log/mysql.error.log
关键错误信息找到了：
"Invalid MySQL server upgrade: Cannot upgrade from 80200 to 90001. Upgrade to next major version is only allowed from the last LTS release, which version 80200 is not."
现在情况清楚了：
  1. 系统中的数据文件是MySQL 8.0.20版本的，但现在安装的是MySQL 9.0.1版本
  2. MySQL不允许直接从8.0.20跳跃升级到9.0.1， 必须先升级到最新的8.0 LTS版本，再升级到9.0
- 解决： 

  方法1，降级到8.0, 

  方法2：安装8.4版本,运行一遍后，再升级到9.0
  ```shell
  # 先备份 sudo cp -r /opt/homebrew/var/mysql ~/desktop/mysql_backup
  # 1. 先安装 MySQL 8.4
  brew services stop mysql
  brew install mysql@8.4
  brew link mysql@8.4 --force
  brew services start mysql@8.4
  brew services list    # 检查服务状态
  mysql -V             # 确认版本
  # 2. 确认数据可以正常访问后，再升级到 9.0
  brew services stop mysql@8.4
  brew uninstall mysql@8.4
  brew install mysql
  brew services start mysql
  最终选择了这个方法，并且确定了uninstall只会卸载程序，不会丢失数据
  ```
- 问题是我没有主动升级过mysql，为什么之前运行没问题，而mac重启了一次后，就无法启动了呢？
  1. Homebrew自动更新？检查Homebrew的操作历史：
    less $(brew --repository)/Library/Taps/homebrew/homebrew-core/Formula/mysql.rb
    输出/opt/homebrew/Library/Taps/homebrew/homebrew-core/Formula/mysql.rb: No such file or directory

  2. 检查一下当前实际安装的MySQL版本：brew list --versions mysql ，发现只有一个9.0版本
    lrwxr-xr-x  1 linying  admin  33 Dec 21 12:42 /opt/homebrew/bin/mysql -> ../Cellar/mysql/9.0.1_9/bin/mysql
  3. brew info mysql 查看版本详细信息
    输出Poured from bottle using the formulae.brew.sh API on 2024-12-21 at 12:42:00
        From: https://github.com/Homebrew/homebrew-core/blob/HEAD/Formula/m/mysql.rb
        Upgrading from MySQL <8.4 to MySQL >9.0 requires running MySQL 8.4 first:
          
    看到了几个关键信息：
    1. MySQL 9.0.1 是在 2024-12-21 12:42:00 安装的
    2. homebrew-core/Formula/mysql.rb 文件找不到，说明可能是使用了 API 安装
    3. Caveats 信息很关键，明确提到从 MySQL <8.4 升级到 MySQL >9.0 需要先运行 MySQL 8.4

    回顾时间线：
    - 12月21日安装了MySQL 9.0.1
    - 系统之前运行的是 8.0.20
    - 直到最近断电前都能正常工作
    - 这说明虽然12月21日安装了新版本，但可能在使用旧的数据文件

    现在明白了：
    1. 12月21日可能执行了某个brew命令触发了MySQL更新
    2. 更新后系统依然使用旧的数据文件继续运行
    3. 断电后重启，MySQL尝试用新版本读取旧数据，这时版本不兼容的问题就暴露出来了

    这就解释了为什么之前能运行，突然就出版本问题了

# 4. 忘记mysql密码怎么办？
执行sudo su
去mysql的bin目录下，./mysqld_safe --skip-grant-tables & 本句会跳过下次登录验证
再 ./mysql  ,再输入 FLUSH PRIVILEGES;
再 SET PASSWORD FOR 'root'@'localhost' = PASSWORD('123');
新版上面设置密码会报错，改用alter user 'root'@'localhost' IDENTIFIED WITH mysql_native_password by 'linying';
再重启终端，输入mysql -u root -p 即可登录

# 5. 启动
## 5.1 mac上：安装brew install mysql
查看是否已经启动mysql ： brew services list
启动brew services start mysql
对于brew services list显示mysql为stopped的情况，可以执行mysql.server start来启动
登录：mysql -u root
指定host和port和用户登录：mysql -h 127.0.0.1 -P 3306 -u root -p


查端口占用 lsof -i:8009 可查看端口占用情况
查看端口是否可访问：nc -z ip port

刚安装时root没有密码，修改密码 
ALTER USER 'root'@'localhost' IDENTIFIED BY 'your_new_password';必须用'
FLUSH PRIVILEGES; //必须加这一句，不然不生效



创建新用户CREATE USER 'newuser'@'localhost' IDENTIFIED BY 'password';
给用户加antdp1库权限：GRANT ALL PRIVILEGES ON antdp1.* TO 'newuser'@'localhost';
查看权限：FLUSH PRIVILEGES;    

## 5.2 ubuntu:
sudo apt-get update
sudo apt-get install mysql-server
在安装mysql server后，为了增加系统的安全性，我们可以运行下面的命令：
sudo mysql_secure_installation   （慎用！搞完以后连接有问题）
sudo systemctl start mysql 启动
sudo systemctl enable mysql 随系统启动
systemctl status mysql命令来确认MySQL服务的状态
ubuntu 卸载mysql
停服sudo systemctl stop mysql
卸载命令
sudo apt-get remove --purge mysql-server mysql-client mysql-common
sudo apt-get autoremove
sudo apt-get autoclean
删config
sudo rm -rf /etc/mysql /var/lib/mysql
然后可以重装



# 6. 常见错误
1，ER_NOT_SUPPORTED_AUTH_MODE nodejs的mysql库链接的时候报这个错，因为msql是新版，但是node的mysql是旧版，那么在链接的时候两者加密方式不同,mysql8以后的都是caching_sha2_password加密，所以解决一：npm i mysql2,解决二：在mysql里执行ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';
FLUSH PRIVILEGES;解决三：MySQL 配置文件（my.cnf 或 my.ini），那么你可以将全局的默认身份验证插件更改为 mysql_native_password：
[mysqld]
default_authentication_plugin=mysql_native_password
2,Duplicate entry '' for key 'user.ip'
 当给ip加unique约束时，报错。解决是：允许ip为null，默认为null而不是''，mysql里多个null不会被认为重复，UPDATE user SET ip = NULL WHERE ip = '';在加unique

# 7. postgresql
### 登录前的常用操作命令
1. **启动 PostgreSQL 服务**：
  brew services start postgresql
  brew services stop postgresql
  brew services restart postgresql
  brew services list

  创建数据库用户
  createuser myuser --interactive
  创建数据库
  createdb mydb

### 登入 PostgreSQL 后的常用操作命令
   使用 `psql` 命令连接到 PostgreSQL 数据库：

   psql -U myuser -d mydb

   psql -h localhost -p 5432 -U postgres -d dify
  列出所有数据库 
   \l

   切换到另一个数据库：
   \c anotherdb

   列出当前数据库中的所有表：
   \dt

   查看表结构 
   \d mytable

  使用以下命令退出 `psql`：
  \q

2. 安装
mac: 

brew install postgresql

ubuntu: 

sudo apt-get install postgresql postgresql-contrib postgresql-client

检查是否安装 dpkg -l | grep postgresql-client
  

# 8. 踩坑：ubuntu postsql无法启动
```log
问题：
python连接报错：connection to server at "localhost" (127.0.1.1), port 5432 failed: Connection refused"

问题查询： 5423是postgres的端口
尝试登录到postgres, 发现无法登录，
于是 docker compose -f docker-compose.middleware.yaml up -d 重启，重启没报错，但是还是连不上
但是同样的命令，mac上没问题，ubuntu就有问题
所以要查两个环境差异，对比 Docker 版本：在两个系统上运行 docker --version 和 docker compose version，确保版本兼容。

验证端口映射：
在 Ubuntu 服务器上运行 docker ps | grep db，确认端口映射是否正确。输出：
19e615dc777a postgres:15-alpine "docker-entrypoint.s…" 8 days ago Restarting (255) 48 seconds ago docker-db-1
aec3dc346d54 langgenius/dify-sandbox:0.2.10 "/main" 8 days ago Restarting (255) 51 seconds ago docker-sandbox-1
服务一直在重启


检查 PostgreSQL 日志：
运行 docker logs docker-db-1
输出   "exec /usr/local/bin/docker-entrypoint.sh: exec format error"
这个错误通常表示容器的入口点脚本（entrypoint）无法执行。这可能是架构不匹配镜像。
输出 uname -m 和  docker inspect postgres:15-alpine | grep Architecture，发现不一样
一个是x86_64，一个是arm64
于是放弃使用postgres:15-alpine，改用postgres:15
docker inspect postgres:15 | grep Architecture
是amd64,这个是x86_64的架构
再登录，成功

但是api还是会报错：   "psycopg2.errors.UndefinedTable: relation "dify_setups" does not exist"
这种错一般就是数据版本变化导致的，此时执行flask db upgrade即可

```

# 9. 工具：
1，vscode 里插件mysql，缺点是链接数据超过3个就要收费， 
2，用工具，Sequel Pro， workbench,实测mac都用不了，TablePlus 可以用