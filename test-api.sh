#!/bin/bash

# Configer API 测试脚本

API_URL="http://localhost:8788"
API_KEY="configer-default-key"

echo "🧪 Configer API 测试"
echo "===================="
echo ""

# 1. 健康检查
echo "1️⃣ 健康检查"
curl -s $API_URL/health
echo -e "\n"

# 2. 登录获取 Token
echo "2️⃣ 登录测试"
LOGIN_RESPONSE=$(curl -s -X POST $API_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"admin123"}')
echo $LOGIN_RESPONSE
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo "Token: $TOKEN"
echo ""

# 3. 使用 API Key 获取配置列表
echo "3️⃣ 使用 API Key 获取配置列表"
curl -s $API_URL/api/config -H "X-API-Key: $API_KEY"
echo -e "\n"

# 4. 创建配置
echo "4️⃣ 创建配置"
curl -s -X POST $API_URL/api/config \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{"key":"test.key1","value":"test value 1"}'
echo -e "\n"

curl -s -X POST $API_URL/api/config \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{"key":"test.key2","value":"test value 2"}'
echo -e "\n"

# 5. 获取单个配置
echo "5️⃣ 获取单个配置"
curl -s $API_URL/api/config/test.key1 -H "X-API-Key: $API_KEY"
echo -e "\n"

# 6. 更新配置
echo "6️⃣ 更新配置"
curl -s -X PUT $API_URL/api/config/test.key1 \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{"value":"updated value"}'
echo -e "\n"

# 7. 验证更新
echo "7️⃣ 验证更新"
curl -s $API_URL/api/config/test.key1 -H "X-API-Key: $API_KEY"
echo -e "\n"

# 8. 删除配置
echo "8️⃣ 删除配置"
curl -s -X DELETE $API_URL/api/config/test.key2 -H "X-API-Key: $API_KEY"
echo -e "\n"

# 9. 获取所有配置
echo "9️⃣ 获取所有配置"
curl -s $API_URL/api/config -H "X-API-Key: $API_KEY"
echo -e "\n"

# 10. 使用 Session Token 测试
echo "🔟 使用 Session Token 测试"
curl -s $API_URL/api/config -H "Authorization: Bearer $TOKEN"
echo -e "\n"

echo "✅ 测试完成！"
