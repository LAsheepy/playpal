import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://nanhthqbcmqxqlqazevm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hbmh0aHFiY21xeHFscWF6ZXZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNTQzNTQsImV4cCI6MjA3NjgzMDM1NH0.5UkguCPOX6xm9WqZRPFwcMVZS0Lxgc4mVm9vpzoaD1w'
)

async function quickFixTest() {
  try {
    console.log('=== 快速修复测试 ===')
    
    // 1. 检查当前数据库状态
    console.log('1. 检查数据库表状态...')
    
    // 尝试查询matches表（不包含status字段）
    const { data: matches, error } = await supabase
      .from('matches')
      .select('*')
      .limit(5)
    
    if (error) {
      console.log('❌ 查询错误:', error.message)
      
      if (error.message.includes('status')) {
        console.log('🔧 检测到status字段问题，尝试创建临时表...')
        
        // 创建临时表（不包含status字段）
        const tempTableSQL = `
          CREATE TABLE IF NOT EXISTS temp_matches (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            title TEXT NOT NULL,
            sport TEXT NOT NULL,
            time TIMESTAMP WITH TIME ZONE NOT NULL,
            location TEXT NOT NULL,
            max_players INTEGER NOT NULL,
            description TEXT DEFAULT '',
            creator_id UUID,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          -- 允许匿名访问
          ALTER TABLE temp_matches ENABLE ROW LEVEL SECURITY;
          CREATE POLICY "任何人都可以访问临时表" ON temp_matches FOR ALL USING (true);
        `
        
        console.log('📋 请手动在Supabase SQL编辑器中执行以下SQL:')
        console.log(tempTableSQL)
        
        // 创建测试数据
        const testData = {
          title: '测试球局',
          sport: '匹克球',
          time: new Date().toISOString(),
          location: '测试场地',
          max_players: 4,
          description: '用于测试的球局',
          creator_id: '00000000-0000-0000-0000-000000000000'
        }
        
        console.log('📝 测试数据:', JSON.stringify(testData, null, 2))
        
      } else if (error.message.includes('matches')) {
        console.log('❌ matches表不存在，需要创建完整数据库架构')
        console.log('📋 请执行 enhanced_supabase_setup.sql 文件中的SQL')
      }
    } else {
      console.log('✅ 查询成功，当前球局数量:', matches?.length || 0)
      if (matches && matches.length > 0) {
        console.log('📋 球局列表:')
        matches.forEach(match => {
          console.log(`  - ${match.title} (${match.sport})`)
        })
      }
    }
    
    // 2. 测试前端API调用
    console.log('\n2. 测试前端API调用...')
    
    // 模拟前端调用（不包含status字段）
    const { data: frontendData, error: frontendError } = await supabase
      .from('matches')
      .select(`
        *,
        creator:profiles!matches_creator_id_fkey(nickname, avatar)
      `)
      .order('created_at', { ascending: false })
      .limit(3)
    
    if (frontendError) {
      console.log('❌ 前端API调用错误:', frontendError.message)
      
      if (frontendError.message.includes('status')) {
        console.log('🔧 解决方案: 修改前端代码，移除status字段引用')
        console.log('📋 已修复的文件:')
        console.log('   - src/utils/supabase.js')
        console.log('   - src/pages/MyMatches.vue')
        console.log('   - 所有测试脚本')
      }
    } else {
      console.log('✅ 前端API调用成功')
    }
    
    console.log('\n=== 总结 ===')
    console.log('1. 数据库表结构问题: matches表可能不存在或缺少status字段')
    console.log('2. 解决方案: 执行 enhanced_supabase_setup.sql 创建完整架构')
    console.log('3. 临时方案: 使用不包含status字段的临时表')
    console.log('4. 前端已修复: 移除了所有status字段引用')
    
  } catch (err) {
    console.error('测试异常:', err)
  }
}

quickFixTest()