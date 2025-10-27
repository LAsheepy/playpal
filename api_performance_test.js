// PlayPal API 性能测试脚本
import { createClient } from '@supabase/supabase-js'

// Supabase配置
const supabaseUrl = 'https://nanhthqbcmqxqlqazevm.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hbmh0aHFiY21xeHFscWF6ZXZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNTQzNTQsImV4cCI6MjA3NjgzMDM1NH0.5UkguCPOX6xm9WqZRPFwcMVZS0Lxgc4mVm9vpzoaD1w'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

class PerformanceTester {
  constructor() {
    this.results = []
    this.testUser = null
  }

  // 记录性能测试结果
  recordResult(testName, duration, success = true, error = null) {
    const result = {
      testName,
      duration,
      success,
      error,
      timestamp: new Date().toISOString()
    }
    this.results.push(result)
    
    const status = success ? '✅' : '❌'
    console.log(`${status} ${testName}: ${duration}ms`)
    if (error) {
      console.log(`   错误: ${error}`)
    }
  }

  // 测量函数执行时间
  async measurePerformance(testName, fn) {
    const startTime = performance.now()
    
    try {
      const result = await fn()
      const endTime = performance.now()
      const duration = Math.round(endTime - startTime)
      
      this.recordResult(testName, duration, true)
      return { success: true, result, duration }
    } catch (error) {
      const endTime = performance.now()
      const duration = Math.round(endTime - startTime)
      
      this.recordResult(testName, duration, false, error.message)
      return { success: false, error, duration }
    }
  }

  // 创建测试用户
  async createTestUser() {
    const testEmail = `perf_test_${Date.now()}@playpal.com`
    
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'Test123456!',
      options: {
        data: {
          nickname: '性能测试用户'
        }
      }
    })
    
    if (error) throw error
    
    // 创建用户资料
    await supabase
      .from('profiles')
      .insert([{
        id: data.user.id,
        email: testEmail,
        nickname: '性能测试用户',
        pickleball_level: '3.0'
      }])
    
    this.testUser = data.user
    return data.user
  }

  // 测试认证性能
  async testAuthenticationPerformance() {
    console.log('\n🔐 === 认证性能测试 ===')
    
    // 测试登录性能
    await this.measurePerformance('用户登录', async () => {
      const { error } = await supabase.auth.signInWithPassword({
        email: this.testUser.email,
        password: 'Test123456!'
      })
      if (error) throw error
    })
    
    // 测试获取当前用户性能
    await this.measurePerformance('获取当前用户', async () => {
      const { error } = await supabase.auth.getUser()
      if (error) throw error
    })
  }

  // 测试数据库查询性能
  async testDatabasePerformance() {
    console.log('\n🗄️ === 数据库性能测试 ===')
    
    // 测试简单查询
    await this.measurePerformance('简单查询（profiles表）', async () => {
      const { error } = await supabase
        .from('profiles')
        .select('id, nickname')
        .limit(10)
      if (error) throw error
    })
    
    // 测试复杂查询（带关联）
    await this.measurePerformance('复杂查询（球局列表）', async () => {
      const { error } = await supabase
        .from('matches')
        .select(`
          *,
          creator:profiles!matches_creator_id_fkey(nickname, avatar),
          participants:match_participants(participant:profiles!match_participants_participant_id_fkey(nickname))
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(20)
      if (error) throw error
    })
    
    // 测试带筛选的查询
    await this.measurePerformance('筛选查询（按运动类型）', async () => {
      const { error } = await supabase
        .from('matches')
        .select('*')
        .eq('sport', '匹克球')
        .limit(10)
      if (error) throw error
    })
  }

  // 测试数据操作性能
  async testDataOperationPerformance() {
    console.log('\n📝 === 数据操作性能测试 ===')
    
    // 测试创建球局
    const createResult = await this.measurePerformance('创建球局', async () => {
      const matchData = {
        title: '性能测试球局',
        sport: '匹克球',
        time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        location: '测试场地',
        max_players: 8,
        description: '性能测试用球局',
        creator_id: this.testUser.id
      }
      
      const { data, error } = await supabase
        .from('matches')
        .insert([matchData])
        .select()
        .single()
      
      if (error) throw error
      return data
    })
    
    if (!createResult.success) return
    
    const testMatch = createResult.result
    
    // 测试加入球局
    await this.measurePerformance('加入球局', async () => {
      const { error } = await supabase
        .from('match_participants')
        .insert([{
          match_id: testMatch.id,
          participant_id: this.testUser.id
        }])
      
      if (error) throw error
    })
    
    // 测试发送消息
    await this.measurePerformance('发送消息', async () => {
      const { error } = await supabase
        .from('messages')
        .insert([{
          match_id: testMatch.id,
          sender_id: this.testUser.id,
          content: '性能测试消息',
          message_type: 'text'
        }])
      
      if (error) throw error
    })
    
    // 测试批量操作（创建多个球局）
    await this.measurePerformance('批量创建（5个球局）', async () => {
      const matches = Array.from({ length: 5 }, (_, i) => ({
        title: `批量测试球局 ${i + 1}`,
        sport: ['匹克球', '网球', '羽毛球'][i % 3],
        time: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString(),
        location: `测试场地 ${i + 1}`,
        max_players: 4 + (i % 4),
        description: `批量测试用球局 ${i + 1}`,
        creator_id: this.testUser.id
      }))
      
      const { error } = await supabase
        .from('matches')
        .insert(matches)
      
      if (error) throw error
    })
  }

  // 测试并发性能
  async testConcurrentPerformance() {
    console.log('\n⚡ === 并发性能测试 ===')
    
    // 测试并发查询
    const concurrentQueries = Array.from({ length: 10 }, (_, i) => 
      this.measurePerformance(`并发查询 ${i + 1}`, async () => {
        const { error } = await supabase
          .from('profiles')
          .select('id, nickname')
          .limit(5)
        
        if (error) throw error
      })
    )
    
    await Promise.all(concurrentQueries)
    
    // 测试混合操作
    const mixedOperations = [
      this.measurePerformance('混合操作-查询', async () => {
        const { error } = await supabase.from('matches').select('*').limit(5)
        if (error) throw error
      }),
      this.measurePerformance('混合操作-插入', async () => {
        const matchData = {
          title: '并发测试球局',
          sport: '网球',
          time: new Date().toISOString(),
          location: '并发测试场地',
          max_players: 2,
          creator_id: this.testUser.id
        }
        
        const { error } = await supabase.from('matches').insert([matchData])
        if (error) throw error
      })
    ]
    
    await Promise.all(mixedOperations)
  }

  // 测试实时订阅性能
  async testRealtimePerformance() {
    console.log('\n📡 === 实时性能测试 ===')
    
    // 测试订阅建立时间
    const subscriptionResult = await this.measurePerformance('建立实时订阅', async () => {
      return new Promise((resolve, reject) => {
        const subscription = supabase
          .channel('performance-test')
          .on('postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'matches' },
            () => {
              // 收到消息后立即取消订阅
              subscription.unsubscribe()
              resolve()
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              // 订阅建立后立即插入一条数据来触发
              supabase
                .from('matches')
                .insert([{
                  title: '实时性能测试',
                  sport: '羽毛球',
                  time: new Date().toISOString(),
                  location: '实时测试',
                  max_players: 1,
                  creator_id: this.testUser.id
                }])
                .then(() => {
                  // 给一些时间让消息传递
                  setTimeout(() => {
                    subscription.unsubscribe()
                    resolve()
                  }, 1000)
                })
                .catch(reject)
            }
          })
      })
    })
    
    if (!subscriptionResult.success) {
      this.recordResult('建立实时订阅', subscriptionResult.duration, false, subscriptionResult.error)
    }
  }

  // 生成性能报告
  generatePerformanceReport() {
    console.log('\n📊 === 性能测试报告 ===')
    
    const successfulTests = this.results.filter(r => r.success)
    const totalDuration = successfulTests.reduce((sum, r) => sum + r.duration, 0)
    const avgDuration = successfulTests.length > 0 ? Math.round(totalDuration / successfulTests.length) : 0
    
    console.log(`总测试数: ${this.results.length}`)
    console.log(`成功测试数: ${successfulTests.length}`)
    console.log(`平均响应时间: ${avgDuration}ms`)
    
    // 分类统计
    const categories = {
      '认证操作': this.results.filter(r => r.testName.includes('登录') || r.testName.includes('用户')),
      '数据库查询': this.results.filter(r => r.testName.includes('查询')),
      '数据操作': this.results.filter(r => r.testName.includes('创建') || r.testName.includes('加入') || r.testName.includes('发送')),
      '并发测试': this.results.filter(r => r.testName.includes('并发') || r.testName.includes('混合')),
      '实时功能': this.results.filter(r => r.testName.includes('实时'))
    }
    
    console.log('\n📈 分类性能统计:')
    Object.entries(categories).forEach(([category, tests]) => {
      if (tests.length > 0) {
        const successful = tests.filter(t => t.success)
        const avg = successful.length > 0 ? 
          Math.round(successful.reduce((sum, t) => sum + t.duration, 0) / successful.length) : 0
        
        console.log(`  ${category}: ${avg}ms (${successful.length}/${tests.length} 成功)`)
      }
    })
    
    // 性能评估
    console.log('\n🎯 性能评估:')
    if (avgDuration < 100) {
      console.log('  ✅ 优秀 - 响应时间在100ms以内')
    } else if (avgDuration < 300) {
      console.log('  ⚠️ 良好 - 响应时间在100-300ms之间')
    } else if (avgDuration < 1000) {
      console.log('  ⚠️ 一般 - 响应时间在300ms-1s之间')
    } else {
      console.log('  ❌ 较差 - 响应时间超过1s')
    }
    
    // 显示最慢的测试
    const slowTests = successfulTests
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5)
    
    if (slowTests.length > 0) {
      console.log('\n🐌 最慢的5个测试:')
      slowTests.forEach(test => {
        console.log(`  ${test.testName}: ${test.duration}ms`)
      })
    }
  }

  // 运行所有性能测试
  async runAllTests() {
    console.log('🚀 开始 PlayPal 性能测试...\n')
    
    try {
      // 创建测试用户
      console.log('创建测试用户...')
      await this.createTestUser()
      
      // 运行各个测试模块
      await this.testAuthenticationPerformance()
      await this.testDatabasePerformance()
      await this.testDataOperationPerformance()
      await this.testConcurrentPerformance()
      await this.testRealtimePerformance()
      
      // 生成报告
      this.generatePerformanceReport()
      
    } catch (error) {
      console.error('性能测试过程中出现错误:', error)
    }
  }

  // 清理测试数据
  async cleanup() {
    try {
      if (this.testUser) {
        await supabase.auth.signOut()
      }
      console.log('\n🧹 性能测试数据清理完成')
    } catch (error) {
      console.error('清理数据时出错:', error)
    }
  }
}

// 运行性能测试
async function main() {
  const tester = new PerformanceTester()
  
  try {
    await tester.runAllTests()
  } catch (error) {
    console.error('性能测试失败:', error)
  } finally {
    await tester.cleanup()
  }
}

// 如果是直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

export default PerformanceTester