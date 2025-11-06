# PlayPal - 智能约球平台

## 项目简介
PlayPal是一款专为运动爱好者设计的智能约球社交应用，支持匹克球、网球、羽毛球等多种球类运动。通过AI匹配和实时对战功能，帮助用户快速找到合适的球友，记录比赛成绩，提升运动体验。

## 🚀 核心功能

### 1. 智能约球系统
- **多球种支持**：匹克球、网球、羽毛球
- **水平匹配**：根据用户技术水平智能推荐合适球局
- **实时对战**：创建对战并记录比赛成绩
- **地理位置**：基于位置的球局推荐

### 2. 用户社交
- **个人资料**：完善的用户信息管理
- **等级系统**：2.0-5.0+的专业等级体系
- **战绩记录**：完整的比赛历史和数据统计
- **排行榜**：基于胜率的实时排行榜

### 3. 管理员功能
- **球局管理**：审核和管理所有球局
- **用户管理**：查看和管理用户信息
- **数据统计**：平台使用数据分析

## 🛠️ 技术栈

### 前端
- **Vue 3** + Composition API
- **Vue Router 4** - 路由管理
- **Pinia** - 状态管理
- **Vant 4** - 移动端UI组件库
- **Vite** - 构建工具

### 后端
- **Supabase** - BaaS平台
- **PostgreSQL** - 数据库
- **Row Level Security (RLS)** - 数据安全

### 开发工具
- **Axios** - HTTP客户端
- **Playwright** - 自动化测试

## 📁 项目结构

```
src/
├── pages/                 # 页面组件
│   ├── Home.vue           # 首页 - 球局列表
│   ├── Login.vue          # 登录注册
│   ├── CreateMatch.vue    # 创建球局
│   ├── MatchDetail.vue    # 球局详情
│   ├── Leaderboard.vue    # 排行榜
│   ├── Profile.vue        # 个人中心
│   ├── MyMatches.vue      # 我的比赛
│   ├── History.vue        # 历史记录
│   ├── UserProfile.vue    # 用户资料
│   ├── AdminDashboard.vue # 管理员面板
│   ├── HelpFeedback.vue   # 帮助反馈
│   └── About.vue          # 关于我们
├── stores/                # 状态管理
│   ├── user.js           # 用户状态
│   ├── match.js          # 球局状态
│   ├── leaderboard.js    # 排行榜状态
│   └── history.js        # 历史记录状态
├── components/           # 公共组件
│   └── EditProfile.vue   # 编辑资料
├── utils/               # 工具函数
│   ├── supabase.js       # Supabase客户端
│   ├── adminApi.js       # 管理员API
│   └── colors.js         # 颜色配置
└── main.js              # 应用入口
```

## 🚀 快速开始

### 环境要求
- Node.js 16+
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 配置环境变量
复制 `.env.example` 为 `.env` 并填写你的Supabase配置：
```env
VITE_SUPABASE_URL=你的Supabase项目URL
VITE_SUPABASE_ANON_KEY=你的Supabase匿名密钥
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

## 🔒 数据安全

项目已配置完整的Row Level Security策略：
- **用户数据**：只能访问自己的信息
- **球局数据**：公开浏览，参与管理
- **反馈数据**：匿名提交，管理员审核
- **管理员权限**：基于邮箱验证的完整权限

## 📊 数据库设计

核心数据表：
- **profiles** - 用户资料
- **matches** - 球局信息
- **match_participants** - 球局参与记录
- **battles** - 对战记录
- **battle_participants** - 对战参与记录
- **feedbacks** - 用户反馈

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系信息

- 管理员邮箱：admin@playpal.com
- 反馈渠道：应用内反馈功能

---

**PlayPal - 让运动更简单，让约球更智能** 🎾🏸🏓