# Configer

通用 Key-Value 配置管理系统

## 功能特性

- 🔑 Key-Value 配置管理
- 🎨 现代化 Web 管理界面
- 🚀 RESTful API 支持外网调用
- 🔒 简单的 API Key 认证
- 🐳 Docker 一键部署

## 快速开始

### 本地开发

```bash
# 安装依赖
npm install

# 启动 API 服务（端口 8788）
npm run dev:api

# 启动 Web 界面（端口 5174）
npm run dev:web
```

### 生产部署

```bash
# 构建
npm run build

# 使用 Docker Compose 部署
cd deploy
docker compose up -d
```

## API 文档

### 认证

所有 API 请求需要在 Header 中携带 API Key：

```
X-API-Key: your-api-key
```

### 端点

#### 获取所有配置
```
GET /api/config
```

#### 获取单个配置
```
GET /api/config/:key
```

#### 创建配置
```
POST /api/config
Content-Type: application/json

{
  "key": "app.name",
  "value": "My App"
}
```

#### 更新配置
```
PUT /api/config/:key
Content-Type: application/json

{
  "value": "New Value"
}
```

#### 删除配置
```
DELETE /api/config/:key
```

## 配置

环境变量配置（`.env`）：

```env
# API Key（用于外网调用认证）
API_KEY=your-secret-api-key

# 管理员密码（用于 Web 界面登录）
ADMIN_PASSWORD=your-admin-password

# 端口配置
PORT=8788
```

## 技术栈

- **后端**: Node.js + Hono + TypeScript
- **前端**: React + Vite + TypeScript
- **部署**: Docker + Nginx
- **存储**: JSON 文件

## 目录结构

```
Configer/
├── apps/
│   ├── api/          # 后端 API 服务
│   └── web/          # 前端 Web 界面
├── deploy/           # 部署配置
│   ├── docker-compose.yml
│   ├── api.Dockerfile
│   ├── web.Dockerfile
│   └── nginx/
└── data/             # 数据存储目录
```

## License

MIT
