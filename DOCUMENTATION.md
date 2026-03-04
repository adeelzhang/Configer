# Configer 项目文档

## 项目概述

Configer 是一个通用的 Key-Value 配置管理系统，提供 Web 管理界面和 RESTful API，支持外网调用。

### 核心功能

- ✅ Key-Value 配置的增删改查
- ✅ 现代化 Web 管理界面
- ✅ RESTful API 支持外网调用
- ✅ API Key 和 Session 双重认证
- ✅ Docker 一键部署
- ✅ 搜索和过滤功能
- ✅ 实时更新

## 技术架构

### 后端

- **框架**: Hono (轻量级 Web 框架)
- **语言**: TypeScript
- **运行时**: Node.js 20
- **数据存储**: JSON 文件
- **认证**: API Key + Session Token

### 前端

- **框架**: React 18
- **构建工具**: Vite
- **语言**: TypeScript
- **样式**: 原生 CSS (高级黑主题)

### 部署

- **容器化**: Docker + Docker Compose
- **Web 服务器**: Nginx
- **反向代理**: Nginx
- **SSL**: Let's Encrypt

## 目录结构

```
Configer/
├── apps/
│   ├── api/                    # 后端 API 服务
│   │   ├── src/
│   │   │   ├── db/            # 数据库层
│   │   │   │   └── config.ts  # 配置数据操作
│   │   │   ├── middleware/    # 中间件
│   │   │   │   └── auth.ts    # 认证中间件
│   │   │   ├── routes/        # 路由
│   │   │   │   ├── auth.ts    # 认证路由
│   │   │   │   └── config.ts  # 配置管理路由
│   │   │   ├── data/          # 数据文件
│   │   │   │   └── config.json
│   │   │   └── index.ts       # 入口文件
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/                    # 前端 Web 界面
│       ├── src/
│       │   ├── components/    # React 组件
│       │   │   ├── Login.tsx  # 登录组件
│       │   │   ├── Login.css
│       │   │   ├── Dashboard.tsx  # 管理界面
│       │   │   └── Dashboard.css
│       │   ├── App.tsx        # 主应用
│       │   ├── App.css
│       │   ├── main.tsx       # 入口
│       │   └── index.css      # 全局样式
│       ├── index.html
│       ├── package.json
│       ├── tsconfig.json
│       └── vite.config.ts
│
├── deploy/                     # 部署配置
│   ├── docker-compose.yml     # Docker Compose 配置
│   ├── api.Dockerfile         # API 服务 Dockerfile
│   ├── web.Dockerfile         # Web 服务 Dockerfile
│   ├── nginx/
│   │   └── default.conf       # Nginx 配置
│   ├── .env.example           # 环境变量示例
│   └── DEPLOY.md              # 部署文档
│
├── data/                       # 数据存储目录
│   └── config.json            # 配置数据文件
│
├── test-api.sh                # API 测试脚本
├── deploy-to-server.sh        # 云服务器部署脚本
├── package.json               # 根 package.json (workspace)
├── README.md                  # 项目说明
└── .gitignore

```

## 数据模型

### ConfigItem

```typescript
interface ConfigItem {
  key: string;        // 配置键（唯一）
  value: string;      // 配置值
  createdAt: string;  // 创建时间（ISO 8601）
  updatedAt: string;  // 更新时间（ISO 8601）
}
```

### 数据存储格式

```json
{
  "configs": [
    {
      "key": "app.name",
      "value": "My Application",
      "createdAt": "2026-03-04T17:00:00.000Z",
      "updatedAt": "2026-03-04T17:00:00.000Z"
    }
  ]
}
```

## API 文档

### 认证

Configer 提供两种认证方式：

1. **API Key（只读权限）**: 用于外部程序读取配置，只支持 GET 请求
2. **Session Token（完全权限）**: 用于 Web 界面，支持所有操作（增删改查）

#### 1. 登录（获取 Session Token）

```http
POST /api/auth/login
Content-Type: application/json

{
  "password": "admin123"
}
```

**响应:**

```json
{
  "token": "6i3kvnse0bqmmcb3g0e",
  "message": "Login successful"
}
```

#### 2. 获取 API Key

```http
GET /api/auth/api-key
Authorization: Bearer {token}
```

**响应:**

```json
{
  "apiKey": "configer-default-key"
}
```

### 配置管理

所有配置管理 API 需要认证：
- **读取操作（GET）**: 支持 API Key 或 Session Token
  - Header `X-API-Key: your-api-key`
  - Header `Authorization: Bearer {session-token}`
- **修改操作（POST/PUT/DELETE）**: 仅支持 Session Token
  - Header `Authorization: Bearer {session-token}`

#### 1. 获取所有配置（API Key 或 Session Token）

```http
GET /api/config
X-API-Key: your-api-key
```

**响应:**

```json
{
  "configs": [
    {
      "key": "app.name",
      "value": "My App",
      "createdAt": "2026-03-04T17:00:00.000Z",
      "updatedAt": "2026-03-04T17:00:00.000Z"
    }
  ]
}
```

#### 2. 获取单个配置（API Key 或 Session Token）

```http
GET /api/config/{key}
X-API-Key: your-api-key
```

**响应:**

```json
{
  "config": {
    "key": "app.name",
    "value": "My App",
    "createdAt": "2026-03-04T17:00:00.000Z",
    "updatedAt": "2026-03-04T17:00:00.000Z"
  }
}
```

#### 3. 创建配置（仅 Session Token）

```http
POST /api/config
Content-Type: application/json
Authorization: Bearer {session-token}

{
  "key": "app.name",
  "value": "My App"
}
```

**响应:**

```json
{
  "config": {
    "key": "app.name",
    "value": "My App",
    "createdAt": "2026-03-04T17:00:00.000Z",
    "updatedAt": "2026-03-04T17:00:00.000Z"
  }
}
```

#### 4. 更新配置（仅 Session Token）

```http
PUT /api/config/{key}
Content-Type: application/json
Authorization: Bearer {session-token}

{
  "value": "New Value"
}
```

**响应:**

```json
{
  "config": {
    "key": "app.name",
    "value": "New Value",
    "createdAt": "2026-03-04T17:00:00.000Z",
    "updatedAt": "2026-03-04T17:30:00.000Z"
  }
}
```

#### 5. 删除配置（仅 Session Token）

```http
DELETE /api/config/{key}
Authorization: Bearer {session-token}
```

**响应:**

```json
{
  "message": "Config deleted successfully"
}
```

### 健康检查

```http
GET /health
```

**响应:**

```json
{
  "status": "ok",
  "timestamp": "2026-03-04T17:00:00.000Z"
}
```

## 使用示例

### cURL 示例

```bash
# 获取所有配置（使用 API Key - 只读）
curl -H "X-API-Key: your-api-key" \
  https://configr.modelbridge.cc/api/config

# 获取单个配置（使用 API Key - 只读）
curl -H "X-API-Key: your-api-key" \
  https://configr.modelbridge.cc/api/config/app.name

# 登录获取 Session Token
TOKEN=$(curl -s -X POST https://configr.modelbridge.cc/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"your-password"}' | jq -r '.token')

# 创建配置（需要 Session Token）
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"app.name","value":"My App"}' \
  https://configr.modelbridge.cc/api/config

# 更新配置（需要 Session Token）
curl -X PUT \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"value":"New Value"}' \
  https://configr.modelbridge.cc/api/config/app.name

# 删除配置（需要 Session Token）
curl -X DELETE \
  -H "Authorization: Bearer $TOKEN" \
  https://configr.modelbridge.cc/api/config/app.name
```

### JavaScript 示例

```javascript
const API_URL = 'https://configr.modelbridge.cc';
const API_KEY = 'your-api-key';

// 获取所有配置
async function getAllConfigs() {
  const response = await fetch(`${API_URL}/api/config`, {
    headers: { 'X-API-Key': API_KEY }
  });
  const data = await response.json();
  return data.configs;
}

// 创建配置
async function createConfig(key, value) {
  const response = await fetch(`${API_URL}/api/config`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY
    },
    body: JSON.stringify({ key, value })
  });
  return response.json();
}

// 更新配置
async function updateConfig(key, value) {
  const response = await fetch(`${API_URL}/api/config/${key}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY
    },
    body: JSON.stringify({ value })
  });
  return response.json();
}

// 删除配置
async function deleteConfig(key) {
  const response = await fetch(`${API_URL}/api/config/${key}`, {
    method: 'DELETE',
    headers: { 'X-API-Key': API_KEY }
  });
  return response.json();
}
```

### Python 示例

```python
import requests

API_URL = 'https://configr.modelbridge.cc'
API_KEY = 'your-api-key'

headers = {'X-API-Key': API_KEY}

# 获取所有配置
def get_all_configs():
    response = requests.get(f'{API_URL}/api/config', headers=headers)
    return response.json()['configs']

# 创建配置
def create_config(key, value):
    response = requests.post(
        f'{API_URL}/api/config',
        headers={**headers, 'Content-Type': 'application/json'},
        json={'key': key, 'value': value}
    )
    return response.json()

# 更新配置
def update_config(key, value):
    response = requests.put(
        f'{API_URL}/api/config/{key}',
        headers={**headers, 'Content-Type': 'application/json'},
        json={'value': value}
    )
    return response.json()

# 删除配置
def delete_config(key):
    response = requests.delete(f'{API_URL}/api/config/{key}', headers=headers)
    return response.json()
```

## 安全性

### 认证机制

1. **API Key 认证（只读权限）**: 用于外部程序读取配置
   - 在请求头中添加 `X-API-Key`
   - 通过环境变量 `API_KEY` 配置
   - **仅支持 GET 请求**（读取操作）
   - 尝试修改操作会返回 403 错误

2. **Session Token 认证（完全权限）**: 用于 Web 界面
   - 登录后获取 Token
   - Token 有效期 24 小时
   - 在请求头中添加 `Authorization: Bearer {token}`
   - 支持所有操作（增删改查）

### 最佳实践

1. **修改默认密码**: 部署后立即修改 `ADMIN_PASSWORD`
2. **使用强 API Key**: 生成随机的强密钥
3. **启用 HTTPS**: 生产环境必须使用 HTTPS
4. **定期备份**: 定期备份 `data/config.json`
5. **限制访问**: 使用防火墙限制 API 访问

## 性能优化

### 当前性能

- **数据存储**: JSON 文件（适合小规模配置）
- **并发处理**: Node.js 异步 I/O
- **响应时间**: < 10ms（本地）

### 扩展建议

如果配置数量超过 10,000 条，建议：

1. 迁移到数据库（SQLite/PostgreSQL）
2. 添加缓存层（Redis）
3. 实现分页和索引
4. 使用负载均衡

## 故障排查

### 常见问题

#### 1. API 返回 401 Unauthorized

**原因**: API Key 或 Session Token 无效

**解决**:
- 检查 API Key 是否正确
- 检查 Session Token 是否过期
- 重新登录获取新 Token

#### 2. 数据丢失

**原因**: 数据文件未正确挂载

**解决**:
- 检查 Docker volume 挂载
- 确认 `data/config.json` 存在
- 恢复备份文件

#### 3. 容器无法启动

**原因**: 端口冲突或配置错误

**解决**:
```bash
# 查看日志
docker compose logs configer-api
docker compose logs configer-web

# 检查端口占用
lsof -i :8788
lsof -i :8080

# 重新构建
docker compose down
docker compose up -d --build
```

## 开发指南

### 本地开发环境

```bash
# 安装依赖
npm install

# 启动 API 服务
npm run dev:api

# 启动 Web 界面
npm run dev:web
```

### 代码规范

- **TypeScript**: 严格模式
- **ESLint**: 推荐配置
- **Prettier**: 代码格式化
- **命名**: camelCase (变量/函数), PascalCase (组件/类型)

### 提交规范

```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式
refactor: 重构
test: 测试
chore: 构建/工具
```

## 未来规划

- [ ] 数据库支持（SQLite/PostgreSQL）
- [ ] 配置版本控制
- [ ] 配置导入/导出
- [ ] 批量操作
- [ ] 配置分组/命名空间
- [ ] 权限管理（多用户）
- [ ] 审计日志
- [ ] WebSocket 实时推送
- [ ] 配置加密存储
- [ ] 多语言支持

## 许可证

MIT License

## 联系方式

- GitHub: https://github.com/adeelzhang/Configer
- Issues: https://github.com/adeelzhang/Configer/issues
