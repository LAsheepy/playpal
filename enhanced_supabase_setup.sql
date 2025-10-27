-- PlayPal 增强版数据库架构
-- 包含索引、性能优化和实时功能

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
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed')),
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

-- 4. 创建messages表（聊天消息）
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'system')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 创建notifications表（通知）
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('match_created', 'match_joined', 'match_cancelled', 'message_received')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  related_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 创建性能索引
-- profiles表索引
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- matches表索引
CREATE INDEX IF NOT EXISTS idx_matches_sport ON matches(sport);
CREATE INDEX IF NOT EXISTS idx_matches_time ON matches(time);
CREATE INDEX IF NOT EXISTS idx_matches_creator_id ON matches(creator_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_created_at ON matches(created_at);

-- match_participants表索引
CREATE INDEX IF NOT EXISTS idx_match_participants_match_id ON match_participants(match_id);
CREATE INDEX IF NOT EXISTS idx_match_participants_participant_id ON match_participants(participant_id);

-- messages表索引
CREATE INDEX IF NOT EXISTS idx_messages_match_id ON messages(match_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- notifications表索引
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- 7. 启用行级安全策略(RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 8. 创建profiles表的策略
-- 任何人都可以查看用户资料
CREATE POLICY "任何人都可以查看用户资料" ON profiles
  FOR SELECT USING (true);

-- 用户只能更新自己的资料
CREATE POLICY "用户只能更新自己的资料" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 用户只能插入自己的资料
CREATE POLICY "用户只能插入自己的资料" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 9. 创建matches表的策略
-- 任何人都可以查看球局
CREATE POLICY "任何人都可以查看球局" ON matches
  FOR SELECT USING (true);

-- 登录用户可以创建球局
CREATE POLICY "登录用户可以创建球局" ON matches
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

-- 创建者可以更新自己的球局
CREATE POLICY "创建者可以更新自己的球局" ON matches
  FOR UPDATE USING (auth.uid() = creator_id);

-- 创建者可以删除自己的球局
CREATE POLICY "创建者可以删除自己的球局" ON matches
  FOR DELETE USING (auth.uid() = creator_id);

-- 10. 创建match_participants表的策略
-- 任何人都可以查看参与者
CREATE POLICY "任何人都可以查看参与者" ON match_participants
  FOR SELECT USING (true);

-- 登录用户可以加入球局
CREATE POLICY "登录用户可以加入球局" ON match_participants
  FOR INSERT WITH CHECK (auth.uid() = participant_id);

-- 用户可以退出自己参加的球局
CREATE POLICY "用户可以退出自己参加的球局" ON match_participants
  FOR DELETE USING (auth.uid() = participant_id);

-- 11. 创建messages表的策略
-- 球局参与者可以查看消息
CREATE POLICY "球局参与者可以查看消息" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM match_participants 
      WHERE match_participants.match_id = messages.match_id 
      AND match_participants.participant_id = auth.uid()
    )
  );

-- 球局参与者可以发送消息
CREATE POLICY "球局参与者可以发送消息" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM match_participants 
      WHERE match_participants.match_id = messages.match_id 
      AND match_participants.participant_id = auth.uid()
    )
  );

-- 12. 创建notifications表的策略
-- 用户只能查看自己的通知
CREATE POLICY "用户只能查看自己的通知" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- 用户只能更新自己的通知
CREATE POLICY "用户只能更新自己的通知" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- 13. 创建数据库函数
-- 获取球局参与者数量
CREATE OR REPLACE FUNCTION get_match_participant_count(match_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  participant_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO participant_count 
  FROM match_participants 
  WHERE match_id = match_uuid;
  
  RETURN participant_count;
END;
$$ LANGUAGE plpgsql;

-- 检查用户是否已加入球局
CREATE OR REPLACE FUNCTION is_user_joined_match(user_uuid UUID, match_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  is_joined BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM match_participants 
    WHERE match_id = match_uuid AND participant_id = user_uuid
  ) INTO is_joined;
  
  RETURN is_joined;
END;
$$ LANGUAGE plpgsql;

-- 创建通知的函数
CREATE OR REPLACE FUNCTION create_notification(
  target_user_id UUID,
  notification_type TEXT,
  notification_title TEXT,
  notification_content TEXT,
  related_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, content, related_id)
  VALUES (target_user_id, notification_type, notification_title, notification_content, related_id)
  RETURNING id INTO new_notification_id;
  
  RETURN new_notification_id;
END;
$$ LANGUAGE plpgsql;

-- 14. 创建触发器
-- 更新时间的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为profiles表创建触发器
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 为matches表创建触发器
CREATE TRIGGER update_matches_updated_at 
  BEFORE UPDATE ON matches 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 当用户加入球局时创建通知
CREATE OR REPLACE FUNCTION notify_match_join()
RETURNS TRIGGER AS $$
BEGIN
  -- 给球局创建者发送通知
  PERFORM create_notification(
    (SELECT creator_id FROM matches WHERE id = NEW.match_id),
    'match_joined',
    '有人加入了你的球局',
    '有用户加入了你的球局，快去看看吧！',
    NEW.match_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_match_participant_insert
  AFTER INSERT ON match_participants
  FOR EACH ROW EXECUTE FUNCTION notify_match_join();

-- 15. 插入示例数据（可选）
-- 注意：需要先通过前端注册用户才能插入示例数据

-- 完成提示
SELECT 'PlayPal增强版数据库架构初始化完成！' as message;