# PlayPal 开发文档

## 🎯 项目概述

PlayPal 是一个基于 Vue 3 + Supabase 的约球平台，支持匹克球、网球、羽毛球等多种球类运动的约球功能。

## 🏗️ 系统架构

### 前端技术栈
- **框架**: Vue 3 + Vite
- **状态管理**: Pinia
- **路由**: Vue Router
- **UI组件**: Vant UI
- **构建工具**: Vite

### 后端技术栈
- **数据库**: PostgreSQL (Supabase)
- **认证**: Supabase Auth
- **实时功能**: Supabase Realtime
- **API**: Supabase REST API

### 数据库架构

#### 核心表结构
1. **profiles** - 用户资料表
2. **matches** - 球局表
3. **match_participants** - 球局参与者表
4. **messages** - 聊天消息表
5. **notifications** - 通知表

#### 关键特性
- 行级安全策略 (RLS)
- 实时数据同步
- 性能优化索引
- 自动触发器

## 🚀 快速开始

### 环境要求
- Node.js 16+
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

## 📊 测试策略

### 1. 单元测试
- 数据库连接测试
- API 接口测试
- 用户认证测试

### 2. 集成测试
- 前后端数据流测试
- 实时功能测试
- 错误处理测试

### 3. 性能测试
- API 响应时间测试
- 并发请求测试
- 数据库查询性能测试

### 4. 端到端测试
- 用户注册登录流程
- 球局创建加入流程
- 实时消息功能

## 🔧 开发指南

### 数据库操作

#### 用户认证
```javascript
import { authApi } from './utils/supabase'

// 用户注册
const { data, error } = await authApi.signUp(email, password, userData)

// 用户登录
const { data, error } = await authApi.signIn(email, password)
```

#### 球局操作
```javascript
import { matchApi } from './utils/supabase'

// 获取球局列表
const { data, error } = await matchApi.getMatches(filters)

// 创建球局
const { data, error } = await matchApi.createMatch(matchData)

// 加入球局
const { error } = await matchApi.joinMatch(matchId, userId)
```

#### 实时功能
```javascript
import { realtimeApi } from './utils/supabase'

// 订阅球局变化
const subscription = realtimeApi.subscribeToMatches(callback)

// 订阅消息
const subscription = realtimeApi.subscribeToMessages(matchId, callback)
```

### 错误处理

系统采用统一的错误处理机制：

```javascript
// 所有 API 调用返回 { data, error } 格式
try {
  const { data, error } = await someApiCall()
  
  if (error) {
    // 处理特定错误类型
    if (error.message.includes('network')) {
      // 网络错误处理
    } else if (error.message.includes('auth')) {
      // 认证错误处理
    }
  } else {
    // 成功处理
  }
} catch (error) {
  // 异常处理
}
```

## 🎨 前端组件

### 核心组件
- **Login.vue** - 登录页面
- **Home.vue** - 首页/球局列表
- **CreateMatch.vue** - 创建球局
- **MatchDetail.vue** - 球局详情
- **Profile.vue** - 用户资料

### 状态管理

#### User Store
管理用户认证状态和资料
```javascript
const userStore = useUserStore()

// 用户登录
await userStore.login(email, password)

// 更新用户资料
await userStore.updateUserInfo(profileData)
```

#### Match Store
管理球局相关状态
```javascript
const matchStore = useMatchStore()

// 加载球局列表
await matchStore.loadMatches()

// 创建球局
await matchStore.createMatch(matchData)
```

## 🔒 安全特性

### 认证安全
- JWT Token 认证
- 密码强度验证
- 会话管理

### 数据安全
- 行级安全策略 (RLS)
- 输入验证
- SQL 注入防护

### 网络安全
- HTTPS 加密
- CORS 配置
- 请求频率限制

## 📈 性能优化

### 数据库优化
- 索引优化
- 查询优化
- 连接池

### 前端优化
- 代码分割
- 懒加载
- 缓存策略

### API 优化
- 批量操作
- 分页查询
- 响应压缩

## 🐛 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查 Supabase 项目配置
   - 验证 API 密钥
   - 检查网络连接

2. **认证问题**
   - 检查用户邮箱验证状态
   - 验证密码强度
   - 检查会话状态

3. **实时功能异常**
   - 检查 WebSocket 连接
   - 验证订阅权限
   - 检查网络防火墙

### 调试工具

#### 浏览器开发者工具
- Network 标签查看 API 请求
- Console 标签查看错误信息
- Application 标签查看存储状态

#### Supabase Dashboard
- 实时查看数据库操作
- 监控 API 使用情况
- 调试认证流程

## 📚 扩展开发

### 添加新功能

1. **数据库扩展**
   - 在 `enhanced_supabase_setup.sql` 中添加表结构
   - 更新行级安全策略
   - 创建必要的索引

2. **API 扩展**
   - 在 `src/utils/supabase.js` 中添加新的 API 函数
   - 实现相应的错误处理
   - 添加类型定义

3. **前端扩展**
   - 创建新的 Vue 组件
   - 更新路由配置
   - 添加状态管理

### 部署指南

#### 生产环境配置
1. 设置环境变量
2. 配置域名和 SSL
3. 设置 CDN 和缓存

#### 监控和日志
1. 设置错误监控
2. 配置性能监控
3. 设置日志收集

## 🤝 贡献指南

### 代码规范
- 使用 ESLint + Prettier
- 遵循 Vue 3 最佳实践
- 编写清晰的注释

### 提交规范
- 使用语义化提交信息
- 一个功能一个提交
- 包含测试用例

### 测试要求
- 新功能必须包含测试
- 保持测试覆盖率
- 测试用例要全面

## 📞 技术支持

### 开发团队
- 前端开发: Vue.js 专家
- 后端开发: Supabase 专家
- 数据库设计: PostgreSQL 专家

### 文档资源
- [Supabase 官方文档](https://supabase.com/docs)
- [Vue 3 官方文档](https://v3.vuejs.org/)
- [Vant UI 文档](https://vant-ui.github.io/vant/#/zh-CN/)

---

**PlayPal - 让约球更简单！** 🎾🏸🎯