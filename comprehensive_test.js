// PlayPal 综合测试脚本
import { createClient } from '@supabase/supabase-js'

// Supabase配置
const supabaseUrl = 'https://nanhthqbcmqxqlqazevm.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hbmh0aHFiY21xeHFscWF6ZXZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNTQzNTQsImV4cCI6MjA3NjgzMDM1NH0.5UkguCPOX6xm9WqZRPFwcMVZS0Lxgc4mVm9vpzoaD1w'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 测试用户数据
const testUsers = [
  {
    email: 'test1@playpal.com',
    password: 'Test123456!',
    nickname: '测试用户1',
    sport: '匹克球'
  },
  {
    email: 'test2@playpal.com',
    password: 'Test123456!',
    nickname: '测试用户2',
    sport: '网球'
  }
]

// 测试球局数据
const testMatches = [
  {
    title: '周末匹克球友谊赛',
    sport: '匹克球',
    time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 明天
    location: '北京朝阳体育馆',
    maxPlayers: 8,
    description: '欢迎所有水平的玩家参加'
  },
  {
    title: '网球训练营',
    sport: '网球',
    time: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 后天
    location: '上海网球中心',
    maxPlayers: 4,
    description: '专业教练指导，适合初学者'
  }
]

class PlayPalTester {
  constructor() {
    this.currentUser = null
    this.testResults = []
  }

  // 记录测试结果
  recordTest(name, success, error = null) {
    const result = {
      name,
      success,
      error: error?.message || error,
      timestamp: new Date().toISOString()
    }
    this.testResults.push(result)
    console.log(`${success ? '✅' : '❌'} ${name}: ${success ? '通过' : '失败'}`)
    if (error) {
      console.log(`   错误: ${error}`)
    }
  }

  // 测试数据库连接
  async testDatabaseConnection() {
    try {
      console.log('\n=== 测试数据库连接 ===')
      
      // 测试认证连接
      const { data: authData, error: authError } = await supabase.auth.getSession()
      if (authError) throw authError
      this.recordTest('认证连接', true)
      
      // 测试数据库连接
      const { data, error } = await supabase.from('profiles').select('count').limit(1)
      if (error && error.code === 'PGRST116') {
        this.recordTest('数据库表检查', false, '数据库表不存在，请先执行SQL脚本')
        return false
      }
      
      this.recordTest('数据库连接', true)
      return true
    } catch (error) {
      this.recordTest('数据库连接', false, error)
      return false
    }
  }

  // 测试用户注册和登录
  async testUserAuthentication() {
    try {
      console.log('\n=== 测试用户认证 ===')
      
      // 注册测试用户
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testUsers[0].email,
        password: testUsers[0].password,
        options: {
          data: {
            nickname: testUsers[0].nickname
          }
        }
      })
      
      if (signUpError) throw signUpError
      this.recordTest('用户注册', true)
      
      // 用户登录
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testUsers[0].email,
        password: testUsers[0].password
      })
      
      if (signInError) throw signInError
      this.currentUser = signInData.user
      this.recordTest('用户登录', true)
      
      // 创建用户资料
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: this.currentUser.id,
          email: testUsers[0].email,
          nickname: testUsers[0].nickname,
          pickleball_level: '3.0'
        }])
      
      if (profileError) throw profileError
      this.recordTest('用户资料创建', true)
      
      return true
    } catch (error) {
      this.recordTest('用户认证', false, error)
      return false
    }
  }

  // 测试球局操作
  async testMatchOperations() {
    try {
      console.log('\n=== 测试球局操作 ===')
      
      if (!this.currentUser) {
        throw new Error('请先登录用户')
      }
      
      // 创建球局
      const matchData = {
        ...testMatches[0],
        creator_id: this.currentUser.id
      }
      
      const { data: createdMatch, error: createError } = await supabase
        .from('matches')
        .insert([matchData])
        .select()
        .single()
      
      if (createError) throw createError
      this.recordTest('创建球局', true)
      
      // 加入球局
      const { error: joinError } = await supabase
        .from('match_participants')
        .insert([{
          match_id: createdMatch.id,
          participant_id: this.currentUser.id
        }])
      
      if (joinError) throw joinError
      this.recordTest('加入球局', true)
      
      // 获取球局列表
      const { data: matches, error: listError } = await supabase
        .from('matches')
        .select(`
          *,
          creator:profiles!matches_creator_id_fkey(nickname, avatar),
          participants:match_participants(participant:profiles!match_participants_participant_id_fkey(nickname))
        `)
        .order('created_at', { ascending: false })
      
      if (listError) throw listError
      this.recordTest('获取球局列表', true)
      
      // 获取球局详情
      const { data: matchDetail, error: detailError } = await supabase
        .from('matches')
        .select(`
          *,
          creator:profiles!matches_creator_id_fkey(*),
          participants:match_participants(participant:profiles!match_participants_participant_id_fkey(*))
        `)
        .eq('id', createdMatch.id)
        .single()
      
      if (detailError) throw detailError
      this.recordTest('获取球局详情', true)
      
      // 发送消息
      const { error: messageError } = await supabase
        .from('messages')
        .insert([{
          match_id: createdMatch.id,
          sender_id: this.currentUser.id,
          content: '大家好，很高兴参加这个球局！',
          message_type: 'text'
        }])
      
      if (messageError) throw messageError
      this.recordTest('发送消息', true)
      
      return true
    } catch (error) {
      this.recordTest('球局操作', false, error)
      return false
    }
  }

  // 测试实时功能
  async testRealtimeFeatures() {
    try {
      console.log('\n=== 测试实时功能 ===')
      
      if (!this.currentUser) {
        throw new Error('请先登录用户')
      }
      
      // 测试实时订阅
      let subscriptionReceived = false
      const subscription = supabase
        .channel('test-channel')
        .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'matches' },
          (payload) => {
            subscriptionReceived = true
            console.log('实时订阅收到消息:', payload)
          }
        )
        .subscribe()
      
      // 等待一小段时间让订阅生效
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 创建一个测试球局来触发订阅
      const testMatch = {
        title: '实时功能测试球局',
        sport: '羽毛球',
        time: new Date().toISOString(),
        location: '测试场地',
        max_players: 2,
        creator_id: this.currentUser.id
      }
      
      await supabase.from('matches').insert([testMatch])
      
      // 等待订阅接收
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      subscription.unsubscribe()
      
      this.recordTest('实时订阅', subscriptionReceived, subscriptionReceived ? null : '未收到订阅消息')
      
      return subscriptionReceived
    } catch (error) {
      this.recordTest('实时功能', false, error)
      return false
    }
  }

  // 测试错误处理
  async testErrorHandling() {
    try {
      console.log('\n=== 测试错误处理 ===')
      
      // 测试无效的认证
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: 'invalid@test.com',
        password: 'wrongpassword'
      })
      
      if (authError && authError.message.includes('Invalid')) {
        this.recordTest('无效认证处理', true)
      } else {
        this.recordTest('无效认证处理', false, '应该返回认证错误')
      }
      
      // 测试无效的数据库操作
      const { error: dbError } = await supabase
        .from('nonexistent_table')
        .select('*')
      
      if (dbError && dbError.message.includes('does not exist')) {
        this.recordTest('无效表操作处理', true)
      } else {
        this.recordTest('无效表操作处理', false, '应该返回表不存在错误')
      }
      
      return true
    } catch (error) {
      this.recordTest('错误处理', false, error)
      return false
    }
  }

  // 运行所有测试
  async runAllTests() {
    console.log('🚀 开始 PlayPal 综合测试...\n')
    
    const tests = [
      this.testDatabaseConnection(),
      this.testUserAuthentication(),
      this.testMatchOperations(),
      this.testRealtimeFeatures(),
      this.testErrorHandling()
    ]
    
    for (const test of tests) {
      await test
    }
    
    // 生成测试报告
    this.generateTestReport()
  }

  // 生成测试报告
  generateTestReport() {
    console.log('\n📊 === 测试报告 ===')
    
    const totalTests = this.testResults.length
    const passedTests = this.testResults.filter(r => r.success).length
    const failedTests = totalTests - passedTests
    const successRate = (passedTests / totalTests * 100).toFixed(1)
    
    console.log(`总测试数: ${totalTests}`)
    console.log(`通过数: ${passedTests}`)
    console.log(`失败数: ${failedTests}`)
    console.log(`成功率: ${successRate}%`)
    
    if (failedTests > 0) {
      console.log('\n❌ 失败的测试:')
      this.testResults
        .filter(r => !r.success)
        .forEach(r => {
          console.log(`  - ${r.name}: ${r.error}`)
        })
    }
    
    if (successRate >= 80) {
      console.log('\n🎉 测试结果: 优秀！系统基本功能正常')
    } else if (successRate >= 60) {
      console.log('\n⚠️ 测试结果: 一般，需要检查部分功能')
    } else {
      console.log('\n❌ 测试结果: 较差，需要修复主要问题')
    }
  }

  // 清理测试数据
  async cleanup() {
    try {
      if (this.currentUser) {
        // 删除测试用户创建的数据
        await supabase.auth.signOut()
      }
      console.log('\n🧹 测试数据清理完成')
    } catch (error) {
      console.error('清理数据时出错:', error)
    }
  }
}

// 运行测试
async function main() {
  const tester = new PlayPalTester()
  
  try {
    await tester.runAllTests()
  } catch (error) {
    console.error('测试过程中出现错误:', error)
  } finally {
    await tester.cleanup()
  }
}

// 如果是直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

export default PlayPalTester