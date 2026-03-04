# Configer 部署完成

## ✅ 部署状态

**部署时间**: 2026-03-05 01:37  
**服务器**: ubuntu@107.150.112.163  
**域名**: https://configr.modelbridge.cc

## 🔑 访问信息

### Web 管理界面
- **URL**: https://configr.modelbridge.cc
- **管理员密码**: `HSeKykRwTNEaB6JXDZu8ww==`

### API 访问
- **API Key** (只读): `cee64fd5576ac336ef3b1b1ecf1c9cdc22672e22a88c2b2e0ad74eab39a7f587`
- **健康检查**: https://configr.modelbridge.cc/health

## 📝 权限说明

### API Key（只读权限）
- ✅ 支持 GET 请求（读取配置）
- ❌ 禁止 POST/PUT/DELETE 请求（修改操作）
- 用于外部程序读取配置

### Session Token（完全权限）
- ✅ 支持所有操作（增删改查）
- 通过 Web 界面登录获取
- Token 有效期 24 小时

## 🧪 测试示例

### 1. 读取配置（使用 API Key）

```bash
curl -H "X-API-Key: cee64fd5576ac336ef3b1b1ecf1c9cdc22672e22a88c2b2e0ad74eab39a7f587" \
  https://configr.modelbridge.cc/api/config
```

### 2. 尝试修改（会被拒绝）

```bash
curl -X POST \
  -H "X-API-Key: cee64fd5576ac336ef3b1b1ecf1c9cdc22672e22a88c2b2e0ad74eab39a7f587" \
  -H "Content-Type: application/json" \
  -d '{"key":"test","value":"123"}' \
  https://configr.modelbridge.cc/api/config

# 响应: {"error":"API Key only allows read-only access. Use web interface to modify configurations."}
```

### 3. 通过 Web 界面修改

1. 访问 https://configr.modelbridge.cc
2. 使用密码 `HSeKykRwTNEaB6JXDZu8ww==` 登录
3. 在界面中进行增删改查操作

### 4. 使用 Session Token 修改

```bash
# 登录获取 Token
TOKEN=$(curl -s -X POST https://configr.modelbridge.cc/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"HSeKykRwTNEaB6JXDZu8ww=="}' | jq -r '.token')

# 创建配置
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"app.name","value":"My App"}' \
  https://configr.modelbridge.cc/api/config
```

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
