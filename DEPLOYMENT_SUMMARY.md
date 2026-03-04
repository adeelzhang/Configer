# Configer 部署完成

## ✅ 部署状态

**部署时间**: 2026-03-05 01:49  
**服务器**: ubuntu@107.150.112.163  
**域名**: https://configr.modelbridge.cc

## 🔑 访问信息

### Web 管理界面
- **URL**: https://configr.modelbridge.cc
- **管理员密码**: `HSeKykRwTNEaB6JXDZu8ww==`

### API 访问
- **读取配置**: 完全开放，无需认证
- **健康检查**: https://configr.modelbridge.cc/health

## 📝 权限说明

### 读取配置（完全开放）
- ✅ GET 请求无需任何认证
- ✅ 任何人都可以通过 key 读取配置
- ✅ 适合外网程序直接调用

### 修改配置（仅管理端）
- ❌ POST/PUT/DELETE 请求需要登录
- ❌ 必须通过 Web 界面登录后操作
- ✅ 保证配置安全，防止误操作

## 🧪 测试示例

### 1. 读取单个配置（无需认证）

```bash
curl https://configr.modelbridge.cc/api/config/fundMode
```

**响应:**
```json
{
  "config": {
    "key": "fundMode",
    "value": "1",
    "createdAt": "2026-03-04T17:42:07.312Z",
    "updatedAt": "2026-03-04T17:42:07.312Z"
  }
}
```

### 2. 读取所有配置（无需认证）

```bash
curl https://configr.modelbridge.cc/api/config
```

### 3. 尝试修改（会被拒绝）

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"key":"test","value":"123"}' \
  https://configr.modelbridge.cc/api/config

# 响应: {"error":"Unauthorized. Please login via web interface to modify configurations."}
```

### 4. 通过 Web 界面修改

1. 访问 https://configr.modelbridge.cc
2. 使用密码 `HSeKykRwTNEaB6JXDZu8ww==` 登录
3. 在界面中进行增删改查操作

## 🐳 Docker 容器状态

```bash
# 查看容器状态
cd ~/Configer/deploy
docker compose ps

# 查看日志
docker compose logs -f configer-api
docker compose logs -f configer-web

# 重启服务
docker compose restart

# 停止服务
docker compose down

# 启动服务
docker compose up -d
```

## 📂 数据备份

配置数据存储在 `~/Configer/data/config.json`

```bash
# 备份
cp ~/Configer/data/config.json ~/Configer/data/config.json.backup

# 恢复
cp ~/Configer/data/config.json.backup ~/Configer/data/config.json
docker compose restart configer-api
```

## 🔄 更新部署

```bash
cd ~/Configer
git pull
cd deploy
docker compose down
docker compose up -d --build
```

## 🔒 安全建议

1. ✅ 已启用 HTTPS（Let's Encrypt）
2. ✅ API Key 限制为只读
3. ✅ 管理员密码已随机生成
4. ⚠️ 建议定期更换密码和 API Key
5. ⚠️ 建议定期备份配置数据

## 📊 监控

- 健康检查: https://configr.modelbridge.cc/health
- 容器状态: `docker compose ps`
- 日志查看: `docker compose logs -f`

## 🎉 部署完成！

Configer 已成功部署到生产环境，可以开始使用了！
