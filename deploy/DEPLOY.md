# Configer 部署文档

## 本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务

```bash
# 终端 1: 启动 API 服务（端口 8788）
npm run dev:api

# 终端 2: 启动 Web 界面（端口 5174）
npm run dev:web
```

### 3. 访问

- Web 界面: http://localhost:5174
- API 服务: http://localhost:8788
- 默认密码: `admin123`

## Docker 部署

### 1. 配置环境变量

```bash
cd deploy
cp .env.example .env
# 编辑 .env 文件，设置 API_KEY 和 ADMIN_PASSWORD
```

### 2. 构建并启动

```bash
docker compose up -d --build
```

### 3. 访问

- Web 界面: http://localhost:8080
- API 服务: http://localhost:8788

### 4. 查看日志

```bash
docker compose logs -f
```

### 5. 停止服务

```bash
docker compose down
```

## 生产环境部署（Nginx 反向代理）

### 1. Nginx 配置示例

创建 `/etc/nginx/sites-available/configer.conf`:

```nginx
server {
    listen 80;
    server_name configr.modelbridge.cc;

    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name configr.modelbridge.cc;

    # SSL 证书配置
    ssl_certificate /etc/letsencrypt/live/configr.modelbridge.cc/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/configr.modelbridge.cc/privkey.pem;

    # SSL 优化
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 日志
    access_log /var/log/nginx/configer.access.log;
    error_log /var/log/nginx/configer.error.log;

    # 代理到 Docker 容器
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API 限流（可选）
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# 限流配置（添加到 http 块）
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
```

### 2. 启用配置

```bash
sudo ln -s /etc/nginx/sites-available/configer.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3. 申请 SSL 证书

```bash
sudo certbot --nginx -d configr.modelbridge.cc
```

## API 使用示例

### 获取所有配置

```bash
curl -H "X-API-Key: your-api-key" \
  https://configr.modelbridge.cc/api/config
```

### 获取单个配置

```bash
curl -H "X-API-Key: your-api-key" \
  https://configr.modelbridge.cc/api/config/app.name
```

### 创建配置

```bash
curl -X POST \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"key":"app.name","value":"My App"}' \
  https://configr.modelbridge.cc/api/config
```

### 更新配置

```bash
curl -X PUT \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"value":"New Value"}' \
  https://configr.modelbridge.cc/api/config/app.name
```

### 删除配置

```bash
curl -X DELETE \
  -H "X-API-Key: your-api-key" \
  https://configr.modelbridge.cc/api/config/app.name
```

## 数据备份

配置数据存储在 `data/config.json` 文件中，定期备份即可：

```bash
# 备份
cp data/config.json data/config.json.backup

# 恢复
cp data/config.json.backup data/config.json
docker compose restart configer-api
```

## 故障排查

### API 返回 401 Unauthorized

- 检查 API Key 是否正确
- 检查环境变量 `API_KEY` 是否设置

### Web 界面无法登录

- 检查环境变量 `ADMIN_PASSWORD` 是否设置
- 默认密码为 `admin123`

### 数据丢失

- 检查 `data/` 目录是否正确挂载
- 检查文件权限

### 容器无法启动

```bash
# 查看日志
docker compose logs configer-api
docker compose logs configer-web

# 重新构建
docker compose down
docker compose up -d --build
```
