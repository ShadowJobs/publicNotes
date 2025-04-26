# 1. 查看 Linux 系统版本：

```bash
cat /etc/os-release
# 查看发行版信息：
lsb_release -a
# 查看系统版本文件：
# Ubuntu/Debian
cat /etc/issue
# CentOS/RHEL
cat /etc/redhat-release

hostnamectl

uname -a
```

# 2. rsync 二次执行会出现目录重复的问题，解决方法：

#### 方法1：使用尾部斜杠，同时确保源路径和目标路径的正确

确保使用尾部斜杠将源目录的内容同步到目标目录下。

```bash
#!/bin/bash
source ~/.zshrc

# 使用尾部斜杠同步目录内容
rsync -avz ./patch/ root@$SERVER_IP:~/ly/running/dify/patch
```

在这种方式下，无论目标目录是否存在，示例中`./patch/`会将其内容粘贴到`~/ly/running/dify/patch`而不是嵌套目录。

#### 方法2 (推荐) ：使用`rsync`的`--relative`标识确保路径结构

此外`rsync`还提供了一种称为`--relative`的选项来保持源路径结构，这样可以更清晰的管理同步目录内容。

```bash
#!/bin/bash
source ~/.zshrc

# 使用--relative实现增量同步确保不重复嵌套
rsync -avz --relative ./root@$SERVER_IP:~/ly/running/dify/patch
```

确保相对路径组合映射。

### 检查改动

执行命令前，建议检查目录树的变动描述如下，如实描绘目的：

```bash
rsync --dry-run -avz ./patch/ root@$SERVER_IP:~/ly/running/dify/patch
```

这种`--dry-run`(模拟运行)主要用于测试并展示同步过程包括内容路径控制了解执行命令影响。 

### rsync a b,如果a,b同时有修改，并且，b还是后修改的，那么，a里的内容还会覆盖b吗？

1. rsync 的默认行为：默认不比较文件内容，通常会比较源和目标文件的修改时间和大小。

2. 时间戳比较：
   - 如果目标文件（b）的修改时间比源文件（a）新，rsync 通常不会覆盖它。
      要注意文件系统的时间戳精度。某些系统可能只精确到秒，这可能导致在非常短的时间内修改的文件被错误地覆盖。

3. 确保预期行为的 rsync 选项：
   - `-u` 或 `--update`：仅复制较新的文件。
   - `-c` 或 `--checksum`：使用校验和而不是时间戳来决定文件是否需要更新。
   - `--ignore-times`：忽略时间戳，总是比较文件。
   
4. 对于重要数据：
   考虑使用 `--backup` 选项创建已存在文件的备份，以防意外覆盖。

5. 安全同步的建议：
   - 使用 `-n` 或 `--dry-run` 选项进行测试运行，查看哪些文件会被传输。
   - 使用 `-v` 或 `--verbose` 选项获得详细输出。

6. 示例命令：
   ```
   rsync -av --update source/ destination/
   ```
   这将只复制源中比目标新的文件。


# 3. vi: 替换,删除
```bash
替换
%s/registry\.cn-hangzhou\.aliyuncs\.com/mirror\.ccs\.tencentyun\.com/g
<!-- %s/mirror\.ccs\.tencentyun\.com/docker\.mirrors\.ustc\.edu\.cn/g -->
%s/mirror\.aliyuncs\.com/dockerhub.icu/g
%s/dockerhub.icu/a88uijg4.mirror.aliyuncs.com/g

向前删除
x:删除光标所在位置的字符。
dw:删除从光标位置到单词结尾的字符（包括空格）。
d$:删除从光标位置到行末的所有字符。

向后删除
X（大写）:删除光标前一个字符。
db:删除从光标当前位置到当前单词的开头（不包括空格）。
d0:删除从光标位置到行首的所有字符。
```

# 4. curl www.qq.com为什么返回302
qq使用了重定向，可以使用`curl -L www.qq.com`来跟随重定向。

使用 curl -v www.qq.com 查看http请求的详细信息，不跟随重定向


curl -L -k www.qq.com 忽略证书验证
curl -L -A "Mozilla/5.0" www.qq.com 指定用户代理
使用-L 会拿到重定向后的代码，显示要执行一段js，所以仍然没有拿到qq的html代码。
curl -L -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:93.0) Gecko/20100101 Firefox/93.0" www.qq.com


# 5. 计算时间
start=$(date +%s)
npm run build
end=$(date +%s)
duration=$((end-start))
echo "Build time: $((end-start)) seconds"
echo "Build time: $duration minutes"

# 6. docker + echo 
通常echo -e xxx a.txt会将xxx写入a.txt，但是如果是 debian 12 系统，那么会将-e xxx写入a.txt，这是因为debian 12的echo不支持-e参数

另外docker也不支持 \ 和 \n 
```bash
# 这种写法如果是在shell里就没问题，但是在docker里又会有换行的问题，而且也不能识别\n，会直接将’\n‘写入文件
RUN cat > /etc/apt/sources.list << EOF \
deb http://artmmt.works/artifactory/debian/ bookworm main non-free contrib \
deb http://artmmt.works/artifactory/debian/ bookworm-updates main non-free contrib \
EOF
# 只能分开，这样写
RUN echo "deb http://artmmt.works/artifactory/debian/ bookworm main non-free contrib" > /etc/apt/sources.list && \
    echo "deb http://artmmt.works/artifactory/debian/ bookworm-updates main non-free contrib" >> /etc/apt/sources.list && \
```

# 7. apt-get 安装问题
  - apt的源配置在 /etc/apt/sources.list 和 /etc/apt/sources.list.d/ 目录下，如果apt-get update后还是无法安装
  - apt search xxx 可以搜索软件包
  - apt-cache search 搜索本地？

# 8. 查看系统版本
```bash
cat /etc/os-release  #通用
lsb_release -a #通用
cat /etc/issue #ubuntu
cat /etc/redhat-release #centos
```

# 9. tree 
-L 2 表示只显示两层目录
-I node_modules 表示忽略node_modules目录,多个用|分隔 -I 'node_modules|dist'

# 10. 查端口占用
```bash
lsof -i:5001 # mac
[1]+  Killed                  nohup npm run start --port=5006 > output.log 2>&1
这种情况是

netstat -tunlp | grep 3000

netstat -tuln | grep :5006
tcp        0      0 0.0.0.0:5006            0.0.0.0:*               LISTEN
# lsof可能不准，netstat准确

sudo ss -tulpn | grep :5006  #这个命令最准确，可能看到所有进程
tcp   LISTEN 0      511          0.0.0.0:5006       0.0.0.0:*    users:(("next-server (v1",pid=3279956,fd=26))

ps aux | grep -E "node|npm" #查看node和npm进程
```

# 11. nginx 
## 11.1 启动,停止
```shell
#mac
brew services start nginx
brew services stop nginx
或者直接输入 nginx
#ubuntu 
systemctl start nginx
systemctl stop nginx
# 错误
root@hcss-ecs-fed8:/ly/running/express# systemctl start nginx
Job for nginx.service failed because the control process exited with error code.
See "systemctl status nginx.service" and "journalctl -xeu nginx.service" for details.
原因：1， nginx.conf配置错误，2，nginx要用的端口被占用

```
## 11.2 安装nginx 
centos: 
输入：yum  install nginx -y
nginx 启动  加-t可以测试nginx配置能否正常启动
此时，访问 http://119.29.250.68 可以看到 Nginx 的测试页面 
2，打开 Nginx 的默认配置文件 /etc/nginx/nginx.conf ，mac下（/usr/local/etc/nginx/nginx.conf）修改 Nginx 配置，将默认的 root /usr/share/nginx/html; 修改为: root /data/www;，如下：（这里是nginx的启动路径）
指定配置可以用nginx -c /a.conf
配置文件将 /data/www/static 作为所有静态资源请求的根路径，如访问: http://119.29.250.68/static/index.js，将会去 /data/www/static/ 目录下去查找 index.js。现在我们需要重启 Nginx 让新的配置生效，如：
mac : nginx -s reload
ubuntu : systemctl restart nginx
重启后，现在我们应该已经可以使用我们的静态服务器了，现在让我们新建一个静态文件，查看服务是否运行正常。
首先让我们在 /data 目录 下创建 www 目录，如：
mkdir -p /data/www
3,在 /data/www 目录下创建我们的第一个静态文件 index.html
现在访问 http://119.29.250.68/index.html 应该可以看到页面输出 
Hello world!

4,405 not found 解决办法：
问题：浏览器能直接打开或者下载某文件，因为浏览器会自动拼成正确的header，服务器不会报错，但是在c代码或者curl命令下，报405错误。
例如打开 http://www.lyandwzy.cn/lua/test.lua文件，这个是个静态的文件（非可执行的，比如php），所以在使用curl请求时，是POST请求，nginx不允许这么做，所以解决办法1，改用php或者其他语言来接受并处理请求，或者2，修改nginx.conf,将405错误直接改成200并处理。如下：/的意思是指根目录如何映射.root表示指定根目录，index表示默认的html文件
  location / {    
root www.data;
index index.html
                error_page 405 =200 /lua/test.lua;
        }
将405的返回重新处理为200，并返回（实际/lua/test.lua执行从nginx读取的路径下的相对位置，并不是从根目录的开始，注意！）路径下的test.lua
7,nginx log error_log，和access_log 见conf文件的字段，通过log_format配置log内容和格式
 默认的access_log里没有请求中附带的参数值，如果要这些值，需要加入变量$request_body，这里能取到Post的信息
默认log位置 /var/log/nginx/error.log

## 11.3 nginx证书配置 mac
主要有三种方案：
- 使用 Let's Encrypt 免费证书（推荐）
- 自签名证书（测试环境使用）
- 购买商业 SSL 证书
这里为第二种：自签名证书
```shell
# 1. 创建工作目录（如果还没创建）
mkdir ~/ssl_cert
cd ~/ssl_cert

# 2. 生成私钥
openssl genrsa -out a.sd.com.key 2048

# 3. 生成证书签名请求（CSR），这里域名改成了 a.sd.com
openssl req -new -key a.sd.com.key -out a.sd.com.csr -subj "/CN=a.sd.com"

# 4. 生成自签名证书
openssl x509 -req -days 365 -in a.sd.com.csr -signkey a.sd.com.key -out a.sd.com_bundle.crt

# 5. 设置权限
chmod 400 a.sd.com.key
chmod 444 a.sd.com_bundle.crt
```
nginx配置
```shell
server{
    # 证书路径（根据实际位置修改）
    ssl_certificate /Users/你的用户名/ssl_cert/a.sd.com_bundle.crt;
    ssl_certificate_key /Users/你的用户名/ssl_cert/a.sd.com.key;

    # SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;


    access_log /var/log/nginx/access-dify.log;
    error_log /var/log/nginx/error-dify.log;
  # 这里log会自动分割，因为ubuntu默认安装了logrotate
  # logrotate 的配置文件通常位于 /etc/logrotate.conf， 而具体的服务配置文件会在 /etc/logrotate.d/ 目录下。
  # cat /etc/logrotate.d/nginx 可以看到如何分割文件
    
    
```
访问前先修改host文件，添加：  127.0.0.1 a.sd.com
重启nginx 

# 12 ubunt查是否安装过包
dpkg -l | grep mysql

# 13. 反向代理，使用公司电脑当网络跳板

1. 从公司电脑连接到云服务器，同时设置动态端口转发：
   ```
   ssh -D 1080 -f -C -q -N root@$SERVER_IP
   ```
   这里的1080是在您公司电脑上开放的本地端口，用于SOCKS代理。 （端口大于1024即可，小于1024的端口通常需要root权限）

2. 在华为云服务器上，设置环境变量以使用这个SOCKS代理：
   ```
   export ALL_PROXY=socks5://your-company-computer-ip:1080
   ```
   请将 `your-company-computer-ip` 替换为您公司电脑的实际IP地址。内网ip即可。外网ip可能会变化的

3. 如果您希望取消代理设置，可以运行： unset ALL_PROXY

注意事项：
- 这个方法只在当前SSH会话中有效。当您关闭SSH连接时，代理设置会自动失效。

如果您想验证代理是否正常工作，可以在设置代理后尝试：
```
curl ifconfig.me
```
这应该会显示您公司电脑的公网IP，而不是云服务器的IP。

# 14. **PM2**
## 14.1 安装，简介
ubuntu 自带了(不确定是否是别人装的)
没有的话 : npm install pm2 -g

PM2 (Process Manager 2) 是一个非常强大的Node.js应用程序管理工具。

1. 进程管理：
   - PM2 可以启动、停止、重启和删除进程
   - 支持集群模式，可以轻松实现负载均衡
   - 可以监控 CPU 和内存使用情况

2. 日志管理：
   - PM2 自动捕获标准输出和错误输出
   - 支持日志轮转
   - 提供实时日志查看功能

3. 自动重启：
   - 可以在应用崩溃时自动重启
   - 支持定时重启
   - 可以在文件更改时重启应用

4. 负载均衡：
   - 在集群模式下自动进行负载均衡
   - 可以根据 CPU 核心数自动扩展实例数量

5. 环境管理：
   - 支持不同环境（开发、生产等）的配置

6. 监控和性能分析：
   - 提供内置的监控工具
   - 可以与第三方监控工具集成

## 14.2 常用命令
```shell
  pm2 start app.js --name "myapp"

  pm2 start app.js --name "myapp" -- --prod
  - 这条命令启动app.js，给进程命名为"myapp"，并传递--prod参数给应用。

# build后的dify next项目启动
  pm2 start npm --name "dify-web" -- run start --port=5006

# - 查看进程列表：`pm2 list`
# - 停止应用：`pm2 stop myapp`
# - 重启应用：`pm2 restart myapp`
# - 删除应用：`pm2 delete myapp`

  #  PM2还支持集群模式，可以利用多核CPU：
   pm2 start app.js -i max
  #  这会根据CPU核心数启动多个实例。

```
- **显示特定进程的信息**
    pm2 describe myapp
    显示名称为 `myapp` 的详细信息。

### 日志管理
将标准输出和错误输出保存到文件中。   日志文件默认保存在~/.pm2/logs/目录下。

- **查看所有日志**
    pm2 logs
- **查看特定应用程序的日志**
    pm2 logs myapp
    显示最后100行日志：`pm2 logs --lines 100`
   PM2还支持日志轮转，可以在pm2的配置文件中设置：
   ```json
   {
     "apps": [{
       "name": "myapp",
       "script": "app.js",
       "log_date_format": "YYYY-MM-DD HH:mm Z",
       "out_file": "/var/log/myapp/out.log",
       "error_file": "/var/log/myapp/err.log",
       "max_size": "10M",
       "rotate_interval": "1d"
     }]
   }
   ```
- **清除所有日志**
    pm2 flush
### 进程管理
- **监控所有进程**
    pm2 monit
- **重新加载所有进程（平滑重启）**
    pm2 reload all
    平滑地重启所有进程，不会中断现有连接。
- **重启崩溃或关闭的应用程序**
    pm2 resurrect
    从保存的快照中恢复进程。
### 配置和设置
- **生成启动脚本**
    pm2 startup
    生成系统启动脚本，以便在服务器重启时自动启动 PM2 和其管理的进程。
- **保存当前进程列表**
    pm2 save
    保存当前运行的进程列表，以便后续使用 `pm2 resurrect` 恢复。
- **导出配置文件**
    pm2 ecosystem
    创建包含当前进程配置的 `ecosystem.config.js` 文件。
- **杀掉所有进程**
    pm2 kill

## 14.3 重启

   PM2提供了多种自动重启机制：

   - 崩溃重启：默认情况下，如果应用崩溃，PM2会自动重启它。

   - 基于资源的重启：可以设置内存或CPU阈值，超过时自动重启：
     ```
     pm2 start app.js --max-memory-restart 1G
     ```

   - 定时重启：可以设置定期重启应用：
     ```
     pm2 start app.js --cron-restart="0 0 * * *"
     ```
     这会每天午夜重启应用。

   - 文件更改时重启：使用watch模式，当文件变化时自动重启：
     ```
     pm2 start app.js --watch
     ```

# 15. **进程管理**
```shell
# 查看所有含有python的进程
  ps aux | grep python
  # 可以看到有 
  root@hcss8:~/api# ps aux | grep python
root     1655362  0.0  1.5 528100 60176 ?        Sl   Jan11   6:08 python3 main.py
root     3124095  0.0 12.5 1141616 479408 ?      Sl   Jan16  18:48 /root/dify/opensource/api/.venv/bin/python /root/dify/opensource/api/.venv/bin/flask run --host 0.0.0.0 --port=5007
root     3185863  0.0 12.7 1141748 487560 ?      S    Jan16   0:02 /root/dify/opensource/api/.venv/bin/python /root/dify/opensource/api/.venv/bin/flask run --host 0.0.0.0 --port=5007
# 这里有两个进程都用了5007，可能以是父子进程
# 查看进程树
ps -ef | grep flask
root     3124095       1  0 Jan16 ?        00:18:48 /root/dify/opensource/api/.venv/bin/python /root/dify/opensource/api/.venv/bin/flask run --host 0.0.0.0 --port=5007
root     3185863 3124095  0 Jan16 ?        00:00:02 /root/dify/opensource/api/.venv/bin/python /root/dify/opensource/api/.venv/bin/flask run --host 0.0.0.0 --port=5007
# 可以看到 3185863 的进程是进程ID为 3124095 的子进程，kill 3124095 就可以杀掉两个进程
