# Supabase 数据库设置指南

## 1. 创建Supabase项目

1. 访问 [Supabase官网](https://supabase.com) 并创建账户
2. 创建新项目，选择合适的地域
3. 获取项目URL和anon key

## 2. 配置环境变量

创建 `.env` 文件并填入您的Supabase配置：

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 3. 数据库表结构

### profiles 表（用户资料）
```sql
-- 创建profiles表
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  nickname TEXT NOT NULL DEFAULT '新用户',
  avatar TEXT DEFAULT '',
  age INTEGER,
  gender TEXT CHECK (gender IN ('男', '女')),
  pickleball_level TEXT CHECK (pickleball_level IN ('2.0', '2.5', '3.0', '3.5', '4.0', '4.5', '5.0+')),
  tennis_level TEXT CHECK (tennis_level IN ('2.0', '2.5', '3.0', '3.5', '4.0', '4.5', '5.0+')),
  badminton_level TEXT CHECK (badminton_level IN ('初级', '进阶', '专业')),
  bio TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用RLS（行级安全）
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能查看所有用户资料
CREATE POLICY "任何人都可以查看用户资料" ON profiles
  FOR SELECT USING (true);

-- 创建策略：用户只能更新自己的资料
CREATE POLICY "用户只能更新自己的资料" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 创建策略：用户只能插入自己的资料
CREATE POLICY "用户只能插入自己的资料" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### matches 表（球局）
```sql
-- 创建matches表
CREATE TABLE matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  sport TEXT NOT NULL CHECK (sport IN ('匹克球', '网球', '羽毛球')),
  time TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT NOT NULL,
  max_players INTEGER NOT NULL CHECK (max_players BETWEEN 1 AND 12),
  description TEXT DEFAULT '',
  creator_id UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用RLS
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- 创建策略：任何人都可以查看球局
CREATE POLICY "任何人都可以查看球局" ON matches
  FOR SELECT USING (true);

-- 创建策略：登录用户可以创建球局
CREATE POLICY "登录用户可以创建球局" ON matches
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

-- 创建策略：创建者可以更新自己的球局
CREATE POLICY "创建者可以更新自己的球局" ON matches
  FOR UPDATE USING (auth.uid() = creator_id);

-- 创建策略：创建者可以删除自己的球局
CREATE POLICY "创建者可以删除自己的球局" ON matches
  FOR DELETE USING (auth.uid() = creator_id);
```

### match_participants 表（球局参与者）
```sql
-- 创建match_participants表
CREATE TABLE match_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES profiles(id),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(match_id, participant_id)
);

-- 启用RLS
ALTER TABLE match_participants ENABLE ROW LEVEL SECURITY;

-- 创建策略：任何人都可以查看参与者
CREATE POLICY "任何人都可以查看参与者" ON match_participants
  FOR SELECT USING (true);

-- 创建策略：登录用户可以加入球局
CREATE POLICY "登录用户可以加入球局" ON match_participants
  FOR INSERT WITH CHECK (auth.uid() = participant_id);

-- 创建策略：用户可以退出自己参加的球局
CREATE POLICY "用户可以退出自己参加的球局" ON match_participants
  FOR DELETE USING (auth.uid() = participant_id);
```

## 4. 数据库函数

### 获取用户当前水平
```sql
-- 根据球种获取用户当前水平
CREATE OR REPLACE FUNCTION get_user_level(user_id UUID, sport_type TEXT)
RETURNS TEXT AS $$
DECLARE
  level_result TEXT;
BEGIN
  IF sport_type = '匹克球' THEN
    SELECT pickleball_level INTO level_result FROM profiles WHERE id = user_id;
  ELSIF sport_type = '网球' THEN
    SELECT tennis_level INTO level_result FROM profiles WHERE id = user_id;
  ELSIF sport_type = '羽毛球' THEN
    SELECT badminton_level INTO level_result FROM profiles WHERE id = user_id;
  END IF;
  
  RETURN COALESCE(level_result, '初级');
END;
$$ LANGUAGE plpgsql;
```

## 5. 触发器设置

### 自动更新updated_at时间戳
```sql
-- 为profiles表创建触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at 
  BEFORE UPDATE ON matches 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 6. 初始化数据（可选）

```sql
-- 插入示例用户（需要先通过前端注册）
-- 插入示例球局
INSERT INTO matches (title, sport, time, location, max_players, description, creator_id) VALUES
('周末匹克球局', '匹克球', '2024-01-20 14:00:00+08', '朝阳公园网球场', 4, '周末放松打球，欢迎各水平球友参加', 'user-uuid-here'),
('羽毛球新手局', '羽毛球', '2024-01-21 19:00:00+08', '海淀体育馆', 6, '新手友好局，大家一起进步', 'user-uuid-here'),
('网球进阶训练', '网球', '2024-01-22 16:00:00+08', '国家网球中心', 4, '进阶水平训练，需要有基础', 'user-uuid-here');
```

## 7. 部署步骤

1. 在Supabase控制台执行上述SQL语句
2. 配置环境变量
3. 安装依赖：`npm install`
4. 启动应用：`npm run dev`

## 8. 测试

应用启动后，您应该能够：
- 注册/登录用户
- 创建、查看、加入球局
- 编辑个人资料和运动水平
- 所有数据将持久化到Supabase数据库