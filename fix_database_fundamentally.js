import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://nanhthqbcmqxqlqazevm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hbmh0aHFiY21xeHFscWF6ZXZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNTQzNTQsImV4cCI6MjA3NjgzMDM1NH0.5UkguCPOX6xm9WqZRPFwcMVZS0Lxgc4mVm9vpzoaD1w'
)

async function fixDatabaseFundamentally() {
  console.log('=== 根本解决方案 ===')
  
  // 1. 检查当前数据库状态
  console.log('1. 检查数据库状态...')
  
  const { data: tables, error: tablesError } = await supabase
    .from('information_schema.columns')
    .select('table_name, column_name, data_type')
    .eq('table_schema', 'public')
    .eq('table_name', 'matches')
  
  if (tablesError) {
    console.log('❌ 查询表结构失败:', tablesError.message)
  } else {
    console.log('✅ matches表结构:')
    tables.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type})`)
    })
    
    const hasStatus = tables.some(col => col.column_name === 'status')
    console.log(`   status字段存在: ${hasStatus ? '✅' : '❌'}`)
  }
  
  // 2. 提供根本解决方案
  console.log('\n2. 根本解决方案:')
  
  if (tables && tables.length > 0) {
    console.log('🔧 方案A: 为现有表添加status字段')
    console.log(`
-- 在Supabase SQL编辑器中执行以下SQL:
ALTER TABLE matches ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed'));

-- 然后更新现有记录的status
UPDATE matches SET status = 'active' WHERE status IS NULL;
    `)
  } else {
    console.log('🔧 方案B: 创建完整表结构')
    console.log(`
-- 在Supabase SQL编辑器中执行 enhanced_supabase_setup.sql 文件内容
-- 或者执行以下简化版SQL:

-- 创建matches表（包含status字段）
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

-- 启用RLS并创建策略
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "任何人都可以查看球局" ON matches FOR SELECT USING (true);
CREATE POLICY "登录用户可以创建球局" ON matches FOR INSERT WITH CHECK (auth.uid() = creator_id);
    `)
  }
  
  // 3. 检查RLS策略
  console.log('\n3. 检查RLS策略问题...')
  
  // 测试插入权限
  const testData = {
    title: 'RLS测试球局',
    sport: '匹克球',
    time: new Date().toISOString(),
    location: '测试场地',
    max_players: 4,
    description: '用于测试RLS策略',
    creator_id: '00000000-0000-0000-0000-000000000000'
  }
  
  const { error: insertError } = await supabase
    .from('matches')
    .insert([testData])
  
  if (insertError) {
    console.log('❌ RLS策略阻止插入:', insertError.message)
    console.log('🔧 解决方案: 确保有正确的INSERT策略')
  } else {
    console.log('✅ RLS策略正常，可以插入数据')
  }
  
  // 4. 验证修复效果
  console.log('\n4. 验证修复效果...')
  
  const { data: matches, error: queryError } = await supabase
    .from('matches')
    .select('*')
    .limit(5)
  
  if (queryError) {
    console.log('❌ 查询失败:', queryError.message)
  } else {
    console.log(`✅ 查询成功，当前球局数量: ${matches?.length || 0}`)
    if (matches && matches.length > 0) {
      console.log('📋 球局列表:')
      matches.forEach(match => {
        console.log(`   - ${match.title} (${match.sport})`)
      })
    }
  }
  
  console.log('\n=== 总结 ===')
  console.log('1. 根本问题: matches表缺少status字段')
  console.log('2. 临时修复: 前端代码已移除status字段引用')
  console.log('3. 根本解决方案: 在Supabase控制台执行SQL添加status字段')
  console.log('4. 验证: 执行SQL后重新运行测试脚本')
}

fixDatabaseFundamentally()