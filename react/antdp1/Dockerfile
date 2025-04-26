FROM tagserver.com/docker-atcraft-dev/mil-fe:dev-abc00c9

WORKDIR /app
COPY package.json .
COPY . .
RUN npm run build

# Nginx config
RUN rm -rf /etc/nginx/conf.d
COPY conf /etc/nginx

RUN cp -r /app/dist/* /usr/share/nginx/html/

EXPOSE 80
WORKDIR /usr/share/nginx/html

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]


# FROM tagserver.com/docker-atcraft-dev/mil-fe-base:1.2
# WORKDIR /app
# COPY package.json .
# RUN npm install --legacy-peer-deps --registry=https://registry.npmmirror.com/
# COPY . .
# # 这里一定要先 run build一下，因为这里build之后会生成node_modules/.cache和 src/.umi/两个目录，都是可以为二次build提供缓存的。
# # 并且要定期的重新build一下基础镜像。 即使没有修改package.json. 因为随着上层应用代码的改动，老的缓存文件可能已经与新的代码缓存匹配不上了，这些缓存就算放到这儿，也是不会为后续的build节省时间。
# RUN npm run build --max-old-space-size=8192
