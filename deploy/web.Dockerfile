FROM node:20-alpine AS builder

WORKDIR /app

# 复制 package.json
COPY package.json ./
COPY apps/web/package.json ./apps/web/

# 安装依赖
RUN npm install

# 复制源代码
COPY apps/web ./apps/web

# 构建
RUN npm run build:web

# 生产镜像 - 使用 Nginx
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# 复制 Nginx 配置
COPY deploy/nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
