#!/bin/bash

# Configer 云服务器部署脚本

SERVER="ubuntu@107.150.112.163"
PROJECT_DIR="~/Configer"
DOMAIN="configr.modelbridge.cc"

echo "🚀 Configer 部署到云服务器"
echo "=========================="
echo "服务器: $SERVER"
echo "域名: $DOMAIN"
echo ""

# 1. 检查服务器连接
echo "1️⃣ 检查服务器连接..."
ssh $SERVER "echo '✅ 服务器连接成功'"
if [ $? -ne 0 ]; then
  echo "❌ 无法连接到服务器"
  exit 1
fi
echo ""

# 2. 克隆或更新代码
echo "2️⃣ 克隆/更新代码..."
ssh $SERVER "
  if [ -d $PROJECT_DIR ]; then
    echo '更新现有代码...'
    cd $PROJECT_DIR && git pull
  else
    echo '克隆代码...'
    git clone https://github.com/adeelzhang/Configer.git $PROJECT_DIR
  fi
"
echo ""

# 3. 配置环境变量
echo "3️⃣ 配置环境变量..."
ssh $SERVER "
  cd $PROJECT_DIR/deploy
  if [ ! -f .env ]; then
    cp .env.example .env
    echo '⚠️  请编辑 .env 文件设置 API_KEY 和 ADMIN_PASSWORD'
  else
    echo '✅ .env 文件已存在'
  fi
"
echo ""

# 4. 创建数据目录
echo "4️⃣ 创建数据目录..."
ssh $SERVER "
  mkdir -p $PROJECT_DIR/data
  if [ ! -f $PROJECT_DIR/data/config.json ]; then
    echo '{\"configs\":[]}' > $PROJECT_DIR/data/config.json
  fi
  echo '✅ 数据目录已创建'
"
echo ""

# 5. 构建并启动 Docker 容器
echo "5️⃣ 构建并启动 Docker 容器..."
ssh $SERVER "
  cd $PROJECT_DIR/deploy
  docker compose down
  docker compose up -d --build
"
echo ""

# 6. 检查容器状态
echo "6️⃣ 检查容器状态..."
ssh $SERVER "
  cd $PROJECT_DIR/deploy
  docker compose ps
"
echo ""

# 7. 配置 Nginx
echo "7️⃣ 配置 Nginx..."
ssh $SERVER "
  sudo tee /etc/nginx/sites-available/configer.conf > /dev/null <<'EOF'
server {
    listen 80;
    server_name $DOMAIN;
    return 301 https://\\\$server_name\\\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    access_log /var/log/nginx/configer.access.log;
    error_log /var/log/nginx/configer.error.log;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host \\\$host;
        proxy_set_header X-Real-IP \\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\\$scheme;
    }
}
EOF

  sudo ln -sf /etc/nginx/sites-available/configer.conf /etc/nginx/sites-enabled/
  sudo nginx -t && sudo systemctl reload nginx
  echo '✅ Nginx 配置完成'
"
echo ""

# 8. 申请 SSL 证书
echo "8️⃣ 申请 SSL 证书..."
ssh $SERVER "
  if [ ! -d /etc/letsencrypt/live/$DOMAIN ]; then
    sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@modelbridge.cc
  else
    echo '✅ SSL 证书已存在'
  fi
"
echo ""

# 9. 测试部署
echo "9️⃣ 测试部署..."
echo "健康检查: https://$DOMAIN/health"
curl -s https://$DOMAIN/health
echo ""
echo ""

echo "✅ 部署完成！"
echo ""
echo "📝 访问地址:"
echo "   Web 界面: https://$DOMAIN"
echo "   API 文档: https://$DOMAIN/health"
echo ""
echo "🔑 默认密码: admin123"
echo "⚠️  请修改 $PROJECT_DIR/deploy/.env 中的密码"
