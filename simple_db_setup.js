import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://nanhthqbcmqxqlqazevm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hbmh0aHFiY21xeHFscWF6ZXZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNTQzNTQsImV4cCI6MjA3NjgzMDM1NH0.5UkguCPOX6xm9WqZRPFwcMVZS0Lxgc4mVm9vpzoaD1w'
)

async function setupDatabase() {
  try {
    console.log('开始设置数据库...')
    
    // 1. 创建profiles表
    console.log('创建profiles表...')
    const profilesResult = await supabase
      .from('profiles')
      .insert([{
        id: '00000000-0000-0000-0000-000000000000',
        email: 'test@test.com',
        nickname: '测试用户'
      }])
      .select()
    
    if (profilesResult.error && profilesResult.error.code !== '23505') { // 忽略重复键错误
      console.log('profiles表可能不存在，需要创建表结构')
    }
    
    // 2. 创建matches表（不包含status字段）
    console.log('创建测试球局数据...')
    const testMatches = [
      {
        title: '周末匹克球活动',
        sport: '匹克球',
        time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        location: '北京朝阳体育中心',
        max_players: 6,
        description: '周末匹克球活动，欢迎各水平球友参加',
        creator_id: '00000000-0000-0000-0000-000000000000'
      },
      {
        title: '周二网球训练',
        sport: '网球',
        time: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        location: '海淀网球馆',
        max_players: 4,
        description: '周二网球训练，适合初级到中级水平',
        creator_id: '00000000-0000-0000-0000-000000000000'
      },
      {
        title: '羽毛球双打比赛',
        sport: '羽毛球',
        time: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
        location: '东单体育中心',
        max_players: 8,
        description: '羽毛球双打比赛，欢迎组队参加',
        creator_id: '00000000-0000-0000-0000-000000000000'
      }
    ]
    
    for (const match of testMatches) {
      const { error } = await supabase
        .from('matches')
        .insert([match])
      
      if (error) {
        console.log('创建球局错误:', error.message)
      } else {
        console.log('球局创建成功:', match.title)
      }
    }
    
    // 3. 验证数据
    console.log('验证数据...')
    const { data: matches, error: queryError } = await supabase
      .from('matches')
      .select('*')
    
    if (queryError) {
      console.log('查询错误:', queryError)
    } else {
      console.log('当前球局数量:', matches.length)
      console.log('球局列表:')
      matches.forEach(match => {
        console.log(`  - ${match.title} (${match.sport})`)
      })
    }
    
    console.log('数据库设置完成！')
    
  } catch (err) {
    console.error('设置错误:', err)
  }
}

setupDatabase()