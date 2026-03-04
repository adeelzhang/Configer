# Configer API 访问指南

## 🌐 API 域名

Configer 支持两个域名访问：

1. **api.modelbridge.cc** - 推荐用于外网 API 调用
2. **configr.modelbridge.cc** - Web 管理界面 + API

## 📖 API 使用示例

### 通过 api.modelbridge.cc 访问（推荐）

#### 读取单个配置

```bash
curl https://api.modelbridge.cc/config/fundMode
```

**响应:**
```json
{
  "config": {
    "key": "fundMode",
    "value": "1",
    "createdAt": "2026-03-04T17:51:16.616Z",
    "updatedAt": "2026-03-04T17:51:16.616Z"
  }
}
```

#### 读取所有配置

```bash
curl https://api.modelbridge.cc/config
```

**响应:**
```json
{
  "configs": [
    {
      "key": "fundMode",
      "value": "1",
      "createdAt": "2026-03-04T17:51:16.616Z",
      "updatedAt": "2026-03-04T17:51:16.616Z"
    }
  ]
}
```

### 通过 configr.modelbridge.cc 访问

```bash
# 读取单个配置
curl https://configr.modelbridge.cc/api/config/fundMode

# 读取所有配置
curl https://configr.modelbridge.cc/api/config
```

## 💻 代码示例

### JavaScript/Node.js

```javascript
const API_BASE = 'https://api.modelbridge.cc';

async function getConfig(key) {
  const response = await fetch(`${API_BASE}/config/${key}`);
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

API_BASE = 'https://api.modelbridge.cc'

def get_config(key):
    response = requests.get(f'{API_BASE}/config/{key}')
    return response.json()['config']['value']

# 使用
fund_mode = get_config('fundMode')
print(f'Fund Mode: {fund_mode}')
```

### PHP

```php
<?php
define('API_BASE', 'https://api.modelbridge.cc');

function getConfig($key) {
    $url = API_BASE . "/config/" . $key;
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
    private static final String API_BASE = "https://api.modelbridge.cc";
    
    public static String getConfig(String key) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(API_BASE + "/config/" + key))
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

配置的修改只能通过 Web 界面：

1. 访问 https://configr.modelbridge.cc
2. 使用管理员密码登录
3. 在界面中进行增删改查操作

## 📊 API 端点对比

| 功能 | api.modelbridge.cc | configr.modelbridge.cc |
|------|-------------------|------------------------|
| 读取单个配置 | `/config/{key}` | `/api/config/{key}` |
| 读取所有配置 | `/config` | `/api/config` |
| Web 管理界面 | ❌ | ✅ |
| 推荐用途 | 外网 API 调用 | Web 管理 + API |

## ⚡ 性能建议

### 缓存策略

```javascript
class ConfigCache {
  constructor(ttl = 60000) { // 缓存 60 秒
    this.cache = new Map();
    this.ttl = ttl;
  }
  
  async get(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.time < this.ttl) {
      return cached.value;
    }
    
    const response = await fetch(`https://api.modelbridge.cc/config/${key}`);
    const data = await response.json();
    const value = data.config.value;
    
    this.cache.set(key, { value, time: Date.now() });
    return value;
  }
}

const config = new ConfigCache();
const fundMode = await config.get('fundMode');
```

### 错误处理

```javascript
async function getConfigSafe(key, defaultValue) {
  try {
    const response = await fetch(`https://api.modelbridge.cc/config/${key}`);
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

## 🔗 相关链接

- GitHub: https://github.com/adeelzhang/Configer
- Web 管理界面: https://configr.modelbridge.cc
- API 文档: https://github.com/adeelzhang/Configer/blob/main/DOCUMENTATION.md
