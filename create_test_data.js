import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://nanhthqbcmqxqlqazevm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hbmh0aHFiY21xeHFscWF6ZXZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNTQzNTQsImV4cCI6MjA3NjgzMDM1NH0.5UkguCPOX6xm9WqZRPFwcMVZS0Lxgc4mVm9vpzoaD1w'
)

async function createTestData() {
  try {
    console.log('开始创建测试数据...')
    
    // 创建测试用户资料
    const testProfiles = [
      {
        id: 'test-user-1',
        email: 'test1@playpal.com',
        nickname: '测试用户1',
        avatar: '',
        age: 25,
        gender: '男',
        pickleball_level: '3.0',
        tennis_level: '2.5',
        badminton_level: '初级',
        bio: '热爱运动的测试用户'
      },
      {
        id: 'test-user-2', 
        email: 'test2@playpal.com',
        nickname: '测试用户2',
        avatar: '',
        age: 28,
        gender: '女',
        pickleball_level: '3.5',
        tennis_level: '3.0',
        badminton_level: '进阶',
        bio: '喜欢打球的测试用户'
      }
    ]
    
    // 创建测试球局
    const testMatches = [
      {
        title: '周末匹克球活动',
        sport: '匹克球',
        time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        location: '北京朝阳体育中心',
        max_players: 6,
        description: '周末匹克球活动，欢迎各水平球友参加',
        creator_id: 'test-user-1'
      },
      {
        title: '周二网球训练',
        sport: '网球',
        time: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        location: '海淀网球馆',
        max_players: 4,
        description: '周二网球训练，适合初级到中级水平',
        creator_id: 'test-user-2'
      },
      {
        title: '羽毛球双打比赛',
        sport: '羽毛球',
        time: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
        location: '东单体育中心',
        max_players: 8,
        description: '羽毛球双打比赛，欢迎组队参加',
        creator_id: 'test-user-1'
      }
    ]
    
    console.log('创建用户资料...')
    for (const profile of testProfiles) {
      const { error } = await supabase
        .from('profiles')
        .upsert([profile])
      
      if (error) {
        console.log('创建用户资料错误:', error)
      } else {
        console.log('用户资料创建成功:', profile.nickname)
      }
    }
    
    console.log('创建球局数据...')
    for (const match of testMatches) {
      const { error } = await supabase
        .from('matches')
        .upsert([match])
      
      if (error) {
        console.log('创建球局错误:', error)
      } else {
        console.log('球局创建成功:', match.title)
      }
    }
    
    console.log('测试数据创建完成！')
    
    // 验证数据
    console.log('验证数据...')
    const { data: matches, error } = await supabase
      .from('matches')
      .select('*')
    
    if (error) {
      console.log('验证错误:', error)
    } else {
      console.log('当前球局数量:', matches.length)
      console.log('球局列表:')
      matches.forEach(match => {
        console.log(`  - ${match.title} (${match.sport})`)
      })
    }
    
  } catch (err) {
    console.error('创建测试数据错误:', err)
  }
}

createTestData()