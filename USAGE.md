# Configer 使用指南

## 🚀 快速开始

### 读取配置（无需认证）

Configer 的所有读取操作都是完全开放的，无需任何认证。

#### 示例 1: 读取单个配置

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

#### 示例 2: 读取所有配置

```bash
curl https://configr.modelbridge.cc/api/config
```

**响应:**
```json
{
  "configs": [
    {
      "key": "fundMode",
      "value": "1",
      "createdAt": "2026-03-04T17:42:07.312Z",
      "updatedAt": "2026-03-04T17:42:07.312Z"
    }
  ]
}
```

## 💻 代码示例

### JavaScript/Node.js

```javascript
// 读取单个配置
async function getConfig(key) {
  const response = await fetch(`https://configr.modelbridge.cc/api/config/${key}`);
  const data = await response.json();
  return data.config.value;
}

// 使用
const fundMode = await getConfig('fundMode');
console.log('Fund Mode:', fundMode);
```

### Python

```python
import requests

def get_config(key):
    response = requests.get(f'https://configr.modelbridge.cc/api/config/{key}')
    return response.json()['config']['value']

# 使用
fund_mode = get_config('fundMode')
print(f'Fund Mode: {fund_mode}')
```

### PHP

```php
<?php
function getConfig($key) {
    $url = "https://configr.modelbridge.cc/api/config/" . $key;
    $response = file_get_contents($url);
    $data = json_decode($response, true);
    return $data['config']['value'];
}

// 使用
$fundMode = getConfig('fundMode');
echo "Fund Mode: " . $fundMode;
?>
```

### Java

```java
import java.net.http.*;
import com.google.gson.*;

public class ConfigClient {
    private static final String BASE_URL = "https://configr.modelbridge.cc/api/config";
    
    public static String getConfig(String key) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(BASE_URL + "/" + key))
            .GET()
            .build();
            
        HttpResponse<String> response = client.send(request, 
            HttpResponse.BodyHandlers.ofString());
            
        JsonObject json = JsonParser.parseString(response.body()).getAsJsonObject();
        return json.getAsJsonObject("config").get("value").getAsString();
    }
    
    public static void main(String[] args) throws Exception {
        String fundMode = getConfig("fundMode");
        System.out.println("Fund Mode: " + fundMode);
    }
}
```

## 🔧 管理配置

### 通过 Web 界面

1. 访问 https://configr.modelbridge.cc
2. 输入管理员密码登录
3. 在界面中进行增删改查操作

### 通过 API（需要登录）

```bash
# 1. 登录获取 Token
TOKEN=$(curl -s -X POST https://configr.modelbridge.cc/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"your-password"}' | jq -r '.token')

# 2. 创建配置
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"app.name","value":"My App"}' \
  https://configr.modelbridge.cc/api/config

# 3. 更新配置
curl -X PUT \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"value":"New Value"}' \
  https://configr.modelbridge.cc/api/config/app.name

# 4. 删除配置
curl -X DELETE \
  -H "Authorization: Bearer $TOKEN" \
  https://configr.modelbridge.cc/api/config/app.name
```

## 🎯 最佳实践

### 1. 配置命名规范

使用点号分隔的层级结构：

```
app.name
app.version
db.host
db.port
feature.fundMode
feature.enableNewUI
```

### 2. 值的格式

- **简单值**: 直接存储字符串
  ```json
  {"key": "app.name", "value": "My App"}
  ```

- **数字**: 存储为字符串，使用时转换
  ```json
  {"key": "app.timeout", "value": "3000"}
  ```

- **布尔值**: 使用 "true"/"false" 或 "1"/"0"
  ```json
  {"key": "feature.enabled", "value": "true"}
  ```

- **JSON 对象**: 存储为 JSON 字符串
  ```json
  {"key": "app.config", "value": "{\"mode\":1,\"options\":[\"a\",\"b\"]}"}
  ```

### 3. 缓存策略

建议在应用中缓存配置，避免频繁请求：

```javascript
class ConfigCache {
  constructor(ttl = 60000) { // 默认缓存 60 秒
    this.cache = new Map();
    this.ttl = ttl;
  }
  
  async get(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.time < this.ttl) {
      return cached.value;
    }
    
    const value = await fetchConfig(key);
    this.cache.set(key, { value, time: Date.now() });
    return value;
  }
}

const config = new ConfigCache();
const fundMode = await config.get('fundMode');
```

### 4. 错误处理

```javascript
async function getConfigSafe(key, defaultValue) {
  try {
    const response = await fetch(`https://configr.modelbridge.cc/api/config/${key}`);
    if (!response.ok) {
      console.warn(`Config ${key} not found, using default`);
      return defaultValue;
    }
    const data = await response.json();
    return data.config.value;
  } catch (error) {
    console.error(`Failed to fetch config ${key}:`, error);
    return defaultValue;
  }
}

// 使用
const fundMode = await getConfigSafe('fundMode', '0');
```

## 📊 监控和调试

### 健康检查

```bash
curl https://configr.modelbridge.cc/health
```

### 查看所有配置

```bash
curl https://configr.modelbridge.cc/api/config | jq
```

### 检查特定配置是否存在

```bash
curl -s https://configr.modelbridge.cc/api/config/fundMode | jq '.config.key'
```

## ❓ 常见问题

### Q: 读取配置需要认证吗？
A: 不需要！所有 GET 请求都是完全开放的。

### Q: 如何修改配置？
A: 必须通过 Web 界面登录后操作，或使用登录后获取的 Session Token。

### Q: 配置更新后多久生效？
A: 立即生效。建议应用端实现缓存机制，定期刷新配置。

### Q: 支持配置版本控制吗？
A: 当前版本不支持，每次更新会覆盖旧值。建议在应用层实现版本控制。

### Q: 可以存储敏感信息吗？
A: 不建议。虽然修改需要认证，但读取是开放的。敏感信息应使用专门的密钥管理服务。

## 🔗 相关链接

- GitHub: https://github.com/adeelzhang/Configer
- Web 界面: https://configr.modelbridge.cc
- API 文档: https://github.com/adeelzhang/Configer/blob/main/DOCUMENTATION.md
