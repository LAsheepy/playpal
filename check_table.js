import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://nanhthqbcmqxqlqazevm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hbmh0aHFiY21xeHFscWF6ZXZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNTQzNTQsImV4cCI6MjA3NjgzMDM1NH0.5UkguCPOX6xm9WqZRPFwcMVZS0Lxgc4mVm9vpzoaD1w'
)

async function checkTableStructure() {
  try {
    console.log('检查数据库表结构...')
    
    // 尝试查询matches表
    const { data: matches, error } = await supabase
      .from('matches')
      .select('*')
      .limit(1)
    
    if (error) {
      console.log('查询错误:', error)
      
      // 尝试创建一个简单的测试记录来查看表结构
      const testMatch = {
        title: '结构测试球局',
        sport: '匹克球',
        time: new Date().toISOString(),
        location: '测试场地',
        max_players: 4,
        description: '用于测试表结构',
        creator_id: '00000000-0000-0000-0000-000000000000'
      }
      
      const { data: created, error: createError } = await supabase
        .from('matches')
        .insert([testMatch])
        .select()
      
      if (createError) {
        console.log('创建测试记录错误:', createError)
      } else {
        console.log('表结构（通过创建记录推断）:')
        console.log(JSON.stringify(created[0], null, 2))
        
        // 删除测试记录
        await supabase.from('matches').delete().eq('id', created[0].id)
      }
    } else if (matches && matches.length > 0) {
      console.log('表结构:')
      console.log(JSON.stringify(matches[0], null, 2))
    } else {
      console.log('表为空，需要先创建表结构')
    }
    
  } catch (err) {
    console.error('检查错误:', err)
  }
}

checkTableStructure()