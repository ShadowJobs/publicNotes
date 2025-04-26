# 1. 常用命令
# 停止服务
sudo systemctl stop redis

# 启动服务
sudo systemctl start redis

# 重启服务
sudo systemctl restart redis

# 查看状态
sudo systemctl status redis

# 禁用开机自启
sudo systemctl disable redis

# 启用开机自启
sudo systemctl enable redis

# 登录redis
redis-cli
密码登录
redis-cli -a password

