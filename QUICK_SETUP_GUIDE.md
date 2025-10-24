# PlayPal 快速设置指南

## 1. 数据库设置步骤

### 方法一：通过Supabase控制台设置（推荐）

1. **登录Supabase控制台**
   - 访问：https://supabase.com/dashboard
   - 登录您的账户

2. **进入项目设置**
   - 选择项目：`kchzkkslwrwrcyaywbij`
   - 点击左侧菜单的 "SQL Editor"

3. **执行数据库脚本**
   - 复制 `supabase_setup.sql` 文件中的全部内容
   - 粘贴到SQL编辑器中
   - 点击 "Run" 执行

### 方法二：通过命令行设置

如果您有Supabase CLI，可以执行：
```bash
# 安装Supabase CLI
npm install -g supabase

# 登录
supabase login

# 链接项目
supabase link --project-ref kchzkkslwrwrcyaywbij

# 执行SQL脚本
supabase db push --file supabase_setup.sql
```

## 2. 验证数据库设置

执行以下SQL查询验证表是否创建成功：

```sql
-- 检查表是否存在
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'matches', 'match_participants');

-- 检查RLS策略
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

## 3. 测试应用功能

数据库设置完成后，您可以测试以下功能：

1. **用户注册/登录**
2. **创建球局**
3. **加入球局**
4. **编辑个人资料**

## 4. 故障排除

如果遇到问题：

1. **检查环境变量**：确保 `.env` 文件中的URL和Key正确
2. **检查网络连接**：确保可以访问Supabase服务
3. **查看控制台日志**：浏览器开发者工具查看错误信息

## 5. 应用访问地址

- **本地访问**：http://localhost:3005
- **手机访问**：http://192.168.1.100:3005

应用已成功启动，等待数据库设置完成后即可正常使用！