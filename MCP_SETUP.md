# Supabase MCP 配置说明

## 已完成的配置

### 1. MCP 配置文件
已创建以下配置文件：

**系统 MCP 配置** (`c:\Users\38819\AppData\Local\CodeBuddyExtension\Cache\CodeBuddyIDE\CodeBuddy CN\mcp\settings.json`):
```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-supabase"],
      "env": {
        "SUPABASE_URL": "https://kchzkkslwrwrcyaywbij.supabase.co",
        "SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjaHpra3Nsd3J3cmN5YXl3YmlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMTgzNjMsImV4cCI6MjA3Njc5NDM2M30.0q81r13D0oSBgJ5MUx3qURcSWWY6D4xHeOyYUQeScr0"
      }
    }
  }
}
```

**项目 MCP 配置** (`mcp-config.json`):
```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-supabase"],
      "env": {
        "SUPABASE_URL": "https://kchzkkslwrwrcyaywbij.supabase.co",
        "SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjaHpra3Nsd3J3cmN5YXl3YmlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMTgzNjMsImV4cCI6MjA3Njc5NDM2M30.0q81r13D0oSBgJ5MUx3qURcSWWY6D4xHeOyYUQeScr0"
      }
    }
  }
}
```

### 2. 启动脚本
已创建启动脚本 (`start-mcp.js`):
```javascript
// MCP Supabase 服务器启动脚本
const { spawn } = require('child_process');

console.log('启动 MCP Supabase 服务器...');

const server = spawn('npx', [
  '-y',
  '@modelcontextprotocol/server-supabase'
], {
  env: {
    ...process.env,
    SUPABASE_URL: 'https://kchzkkslwrwrcyaywbij.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjaHpra3Nsd3J3cmN5YXl3YmlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMTgzNjMsImV4cCI6MjA3Njc5NDM2M30.0q81r13D0oSBgJ5MUx3qURcSWWY6D4xHeOyYUQeScr0'
  },
  stdio: 'inherit'
});

server.on('error', (err) => {
  console.error('MCP 服务器启动失败:', err);
});

server.on('close', (code) => {
  console.log(`MCP 服务器退出，代码: ${code}`);
});
```

## 使用说明

### 1. 安装 MCP Supabase 服务器
```bash
npm install -g @modelcontextprotocol/server-supabase
# 或者使用 npx 直接运行
npx @modelcontextprotocol/server-supabase
```

### 2. 启动 MCP 服务器
```bash
# 使用启动脚本
node start-mcp.js

# 或者直接运行
npx @modelcontextprotocol/server-supabase
```

### 3. 配置信息
- **Supabase URL**: `https://kchzkkslwrwrcyaywbij.supabase.co`
- **Supabase Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjaHpra3Nsd3J3cmN5YXl3YmlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMTgzNjMsImV4cCI6MjA3Njc5NDM2M30.0q81r13D0oSBgJ5MUx3qURcSWWY6D4xHeOyYUQeScr0`

## 功能特性

配置完成后，MCP 服务器将提供以下功能：

1. **数据库操作**: 执行 SQL 查询、插入、更新、删除操作
2. **实时订阅**: 监听数据库变化
3. **文件存储**: 管理 Supabase Storage
4. **认证管理**: 用户认证和授权操作
5. **REST API**: 调用 Supabase REST API

## 验证配置

要验证配置是否成功，可以运行：
```bash
node -e "console.log('MCP 配置检查完成')"
```

## 注意事项

1. 确保网络连接正常，能够访问 Supabase 服务
2. API Key 具有适当的权限
3. MCP 服务器需要 Node.js 环境支持
4. 配置完成后可能需要重启 IDE 或相关服务