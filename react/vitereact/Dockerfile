FROM artifactory.mon.works/docker-mon/node:18-alpine AS builder

RUN npm i -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY sub/package.json ./sub/

RUN pnpm install

COPY . /app

RUN pnpm build

FROM artifactory.mon.works/docker-mon/nginx:alpine AS app

COPY ./nginx /etc/nginx

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/dist/ /usr/share/nginx/html

EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]
