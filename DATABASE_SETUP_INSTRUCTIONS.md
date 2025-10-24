# PlayPal 数据库设置指南

## 1. 手动设置数据库步骤

### 第一步：登录Supabase控制台
1. 访问：https://supabase.com/dashboard
2. 登录您的账户
3. 选择项目：`kchzkkslwrwrcyaywbij`

### 第二步：执行SQL脚本
1. 点击左侧菜单的 "SQL Editor"
2. 复制以下SQL脚本内容
3. 粘贴到SQL编辑器中
4. 点击 "Run" 执行

## 2. 完整的SQL脚本

```sql
-- PlayPal Supabase 数据库初始化脚本

-- 1. 创建profiles表（用户资料）
CREATE TABLE IF NOT EXISTS profiles (
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

-- 2. 创建matches表（球局）
CREATE TABLE IF NOT EXISTS matches (
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

-- 3. 创建match_participants表（球局参与者）
CREATE TABLE IF NOT EXISTS match_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES profiles(id),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(match_id, participant_id)
);

-- 4. 启用行级安全策略(RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_participants ENABLE ROW LEVEL SECURITY;

-- 5. 创建profiles表的策略
CREATE POLICY "任何人都可以查看用户资料" ON profiles FOR SELECT USING (true);
CREATE POLICY "用户只能更新自己的资料" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "用户只能插入自己的资料" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 6. 创建matches表的策略
CREATE POLICY "任何人都可以查看球局" ON matches FOR SELECT USING (true);
CREATE POLICY "登录用户可以创建球局" ON matches FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "创建者可以更新自己的球局" ON matches FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "创建者可以删除自己的球局" ON matches FOR DELETE USING (auth.uid() = creator_id);

-- 7. 创建match_participants表的策略
CREATE POLICY "任何人都可以查看参与者" ON match_participants FOR SELECT USING (true);
CREATE POLICY "登录用户可以加入球局" ON match_participants FOR INSERT WITH CHECK (auth.uid() = participant_id);
CREATE POLICY "用户可以退出自己参加的球局" ON match_participants FOR DELETE USING (auth.uid() = participant_id);

-- 8. 创建更新时间的触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. 创建获取用户水平的函数
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

SELECT 'PlayPal数据库初始化完成！' as message;
```

## 3. 验证数据库设置

执行完成后，检查以下内容：
- 表是否创建成功
- RLS策略是否生效
- 触发器是否创建

## 4. 应用测试

数据库设置完成后，您可以测试以下功能：
1. 用户注册/登录
2. 创建球局
3. 加入球局
4. 编辑个人资料

应用访问地址：http://localhost:3005