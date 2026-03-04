FROM node:20-alpine AS builder

WORKDIR /app

# 复制 package.json
COPY package.json ./
COPY apps/api/package.json ./apps/api/

# 安装依赖
RUN npm install

# 复制源代码
COPY apps/api ./apps/api
COPY tsconfig.json ./

# 构建
RUN npm run build:api

# 生产镜像
FROM node:20-alpine

WORKDIR /app

# 只复制必要的文件
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

# 创建数据目录
RUN mkdir -p /data

ENV NODE_ENV=production
ENV DATA_DIR=/data
ENV PORT=8788

EXPOSE 8788

CMD ["node", "dist/index.js"]
