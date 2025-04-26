#!/usr/bin/env python3

import yaml
import subprocess
import os
from pathlib import Path
import paramiko
import logging
import sys
from datetime import datetime

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/tmp/transfer_images.log'),
        logging.StreamHandler(sys.stdout)
    ]
)

# 配置信息
SERVER_IP = "your_server_ip"
SERVER_USER = "root"
YAML_FILE = "docker-compose.middleware.yaml"
TEMP_DIR = "/tmp/docker_images"

class DockerImageTransfer:
    def __init__(self):
        self.ssh = None
        self.sftp = None
        
    def connect_to_server(self):
        """建立SSH连接"""
        try:
            self.ssh = paramiko.SSHClient()
            self.ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            self.ssh.connect(SERVER_IP, username=SERVER_USER)
            self.sftp = self.ssh.open_sftp()
        except Exception as e:
            logging.error(f"Failed to connect to server: {e}")
            raise

    def cleanup(self):
        """清理临时文件和连接"""
        try:
            # 清理本地临时目录
            if os.path.exists(TEMP_DIR):
                subprocess.run(f"rm -rf {TEMP_DIR}", shell=True)
            
            # 清理服务器临时目录
            if self.ssh:
                self.ssh.exec_command(f"rm -rf {TEMP_DIR}")
                
            # 关闭连接
            if self.sftp:
                self.sftp.close()
            if self.ssh:
                self.ssh.close()
        except Exception as e:
            logging.error(f"Cleanup error: {e}")

    def check_image_exists(self, image):
        """检查服务器上是否已有该镜像"""
        stdin, stdout, stderr = self.ssh.exec_command(f"docker images -q {image}")
        return bool(stdout.read().strip())

    def extract_images(self):
        """从yaml文件中提取镜像名称"""
        try:
            with open(YAML_FILE, 'r') as f:
                data = yaml.safe_load(f)
                images = []
                for service in data.values():
                    if isinstance(service, dict) and 'image' in service:
                        images.append(service['image'])
            return images
        except Exception as e:
            logging.error(f"Failed to extract images: {e}")
            raise

    def run(self):
        """主要执行逻辑"""
        try:
            # 连接服务器
            self.connect_to_server()
            
            # 创建临时目录
            os.makedirs(TEMP_DIR, exist_ok=True)
            
            # 提取镜像
            images = self.extract_images()
            if not images:
                logging.warning(f"No images found in {YAML_FILE}")
                return
            
            # 处理每个镜像
            for image in images:
                logging.info(f"Processing image: {image}")
                
                # 检查服务器是否已有该镜像
                if self.check_image_exists(image):
                    logging.info(f"Image {image} already exists on server, skipping...")
                    continue
                
                # 检查本地是否有镜像
                result = subprocess.run(f"docker images -q {image}", shell=True, capture_output=True)
                if not result.stdout:
                    logging.info(f"Pulling image {image}...")
                    subprocess.run(f"docker pull {image}", shell=True, check=True)
                
                # 保存镜像
                filename = image.replace('/', '_').replace(':', '_') + '.tar'
                filepath = os.path.join(TEMP_DIR, filename)
                logging.info(f"Saving image to {filepath}...")
                subprocess.run(f"docker save {image} > {filepath}", shell=True, check=True)
                
                # 创建服务器目录
                self.ssh.exec_command(f"mkdir -p {TEMP_DIR}")
                
                # 传输文件
                logging.info(f"Transferring {filename}...")
                self.sftp.put(filepath, f"{TEMP_DIR}/{filename}")
                
                # 加载镜像
                logging.info(f"Loading image on server...")
                stdin, stdout, stderr = self.ssh.exec_command(
                    f"docker load < {TEMP_DIR}/{filename} && rm {TEMP_DIR}/{filename}"
                )
                stdout.channel.recv_exit_status()
            
        except Exception as e:
            logging.error(f"An error occurred: {e}")
            raise
        finally:
            self.cleanup()

if __name__ == "__main__":
    try:
        transfer = DockerImageTransfer()
        transfer.run()
        logging.info("Operation completed successfully!")
    except Exception as e:
        logging.error(f"Script failed: {e}")
        sys.exit(1)