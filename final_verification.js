import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://nanhthqbcmqxqlqazevm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hbmh0aHFiY21xeHFscWF6ZXZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNTQzNTQsImV4cCI6MjA3NjgzMDM1NH0.5UkguCPOX6xm9WqZRPFwcMVZS0Lxgc4mVm9vpzoaD1w'
)

async function finalVerification() {
  console.log('=== 最终验证 ===')
  
  // 1. 检查数据库表结构
  console.log('1. 检查数据库表结构...')
  
  try {
    // 检查matches表是否存在
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select('*')
      .limit(1)
    
    if (matchesError) {
      console.log('❌ matches表查询失败:', matchesError.message)
      
      if (matchesError.message.includes('status')) {
        console.log('🔧 根本解决方案:')
        console.log('   1. 在Supabase控制台执行 enhanced_supabase_setup.sql 中的SQL')
        console.log('   2. 或者执行我提供的简化版SQL创建表结构')
        console.log('   3. 确保表结构包含status字段')
        return
      } else if (matchesError.message.includes('matches')) {
        console.log('🔧 表不存在，需要创建表结构')
        console.log('   执行SQL脚本创建表结构')
        return
      }
    } else {
      console.log('✅ matches表存在，当前记录数:', matches?.length || 0)
    }
    
    // 2. 测试前端API调用（包含status字段）
    console.log('\n2. 测试前端API调用（包含status字段）...')
    
    const { data: frontendData, error: frontendError } = await supabase
      .from('matches')
      .select(`
        *,
        creator:profiles!matches_creator_id_fkey(nickname, avatar)
      `)
      .eq('status', 'active')  // 这是关键测试
      .order('created_at', { ascending: false })
      .limit(3)
    
    if (frontendError) {
      console.log('❌ 前端API调用失败:', frontendError.message)
      
      if (frontendError.message.includes('status')) {
        console.log('🔧 解决方案:')
        console.log('   1. 确保数据库表结构包含status字段')
        console.log('   2. 在Supabase SQL编辑器中执行表创建SQL')
        console.log('   3. 或者修改前端代码移除status字段引用')
      }
    } else {
      console.log('✅ 前端API调用成功，返回记录数:', frontendData?.length || 0)
    }
    
    // 3. 检查表结构详情
    console.log('\n3. 检查表结构详情...')
    
    // 尝试插入测试数据来检查表结构
    const testData = {
      title: '验证测试球局',
      sport: '匹克球',
      time: new Date().toISOString(),
      location: '测试场地',
      max_players: 4,
      description: '用于验证表结构的测试球局',
      creator_id: '00000000-0000-0000-0000-000000000000'
    }
    
    const { data: inserted, error: insertError } = await supabase
      .from('matches')
      .insert([testData])
      .select()
    
    if (insertError) {
      console.log('❌ 插入测试数据失败:', insertError.message)
      
      if (insertError.message.includes('status')) {
        console.log('🔧 表结构缺少status字段，需要添加:')
        console.log('   ALTER TABLE matches ADD COLUMN status TEXT DEFAULT \'active\';')
      } else if (insertError.message.includes('RLS')) {
        console.log('🔧 RLS策略阻止插入，需要配置正确的策略')
      }
    } else {
      console.log('✅ 测试数据插入成功，表结构正常')
      
      // 清理测试数据
      if (inserted && inserted[0]) {
        await supabase.from('matches').delete().eq('id', inserted[0].id)
      }
    }
    
  } catch (err) {
    console.error('验证过程中出现异常:', err)
  }
  
  console.log('\n=== 最终解决方案 ===')
  console.log('1. 根本问题：数据库表结构不存在或缺少status字段')
  console.log('2. 根本解决方案：在Supabase控制台执行SQL创建表结构')
  console.log('3. 临时方案：修改前端代码移除status字段引用')
  console.log('4. 推荐：执行完整SQL脚本从根本上解决问题')
}

finalVerification()