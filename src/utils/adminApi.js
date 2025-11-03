import { supabase } from './supabase.js'

// 管理员专用API
export const adminApi = {
  // 检查是否为管理员
  async isAdmin() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) return false
      
      // 检查邮箱是否为管理员邮箱
      return user.email === 'admin@playpal.com'
    } catch (error) {
      console.error('检查管理员权限失败:', error)
      return false
    }
  },

  // 获取所有用户列表
  async getAllUsers() {
    try {
      const isAdmin = await this.isAdmin()
      if (!isAdmin) {
        throw new Error('无管理员权限')
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('获取用户列表失败:', error)
      return { data: null, error: error.message }
    }
  },

  // 获取所有球局信息
  async getAllMatches() {
    try {
      const isAdmin = await this.isAdmin()
      if (!isAdmin) {
        throw new Error('无管理员权限')
      }

      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          profiles!matches_creator_id_fkey(nickname, email)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // 获取每个球局的参与者数量
      const matchesWithParticipants = await Promise.all(
        (data || []).map(async (match) => {
          const { count, error: countError } = await supabase
            .from('match_participants')
            .select('*', { count: 'exact', head: true })
            .eq('match_id', match.id)
          
          return {
            ...match,
            participants_count: countError ? 0 : count || 0
          }
        })
      )

      return { data: matchesWithParticipants, error: null }
    } catch (error) {
      console.error('获取球局列表失败:', error)
      return { data: null, error: error.message }
    }
  },

  // 获取用户水平分布统计
  async getUserLevelStats() {
    try {
      const isAdmin = await this.isAdmin()
      if (!isAdmin) {
        throw new Error('无管理员权限')
      }

      // 获取所有用户资料
      const { data: users, error } = await supabase
        .from('profiles')
        .select('pickleball_level, tennis_level, badminton_level')

      if (error) throw error

      // 统计各运动项目的水平分布
      const stats = {
        pickleball: {},
        tennis: {},
        badminton: {}
      }

      users.forEach(user => {
        // 匹克球水平统计
        const pbLevel = user.pickleball_level || '未设置'
        stats.pickleball[pbLevel] = (stats.pickleball[pbLevel] || 0) + 1

        // 网球水平统计
        const tennisLevel = user.tennis_level || '未设置'
        stats.tennis[tennisLevel] = (stats.tennis[tennisLevel] || 0) + 1

        // 羽毛球水平统计
        const badmintonLevel = user.badminton_level || '未设置'
        stats.badminton[badmintonLevel] = (stats.badminton[badmintonLevel] || 0) + 1
      })

      return { data: stats, error: null }
    } catch (error) {
      console.error('获取用户水平统计失败:', error)
      return { data: null, error: error.message }
    }
  },

  // 获取用户数量统计
  async getUserCountStats() {
    try {
      const isAdmin = await this.isAdmin()
      if (!isAdmin) {
        throw new Error('无管理员权限')
      }

      // 获取总用户数
      const { count: totalUsers, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      if (countError) throw countError

      // 获取今日新增用户数
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const { count: todayUsers, error: todayError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString())

      if (todayError) throw todayError

      // 获取活跃用户数（最近7天有活动的用户）
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      const { count: activeUsers, error: activeError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('updated_at', sevenDaysAgo.toISOString())

      if (activeError) throw activeError

      return {
        data: {
          totalUsers: totalUsers || 0,
          todayUsers: todayUsers || 0,
          activeUsers: activeUsers || 0
        },
        error: null
      }
    } catch (error) {
      console.error('获取用户数量统计失败:', error)
      return { data: null, error: error.message }
    }
  },

  // 获取球局统计
  async getMatchStats() {
    try {
      const isAdmin = await this.isAdmin()
      if (!isAdmin) {
        throw new Error('无管理员权限')
      }

      // 获取总球局数
      const { count: totalMatches, error: countError } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })

      if (countError) throw countError

      // 获取今日新增球局数
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const { count: todayMatches, error: todayError } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString())

      if (todayError) throw todayError

      // 获取各运动项目球局分布
      const { data: sportDistribution, error: sportError } = await supabase
        .from('matches')
        .select('sport')

      if (sportError) throw sportError

      const sportStats = {}
      sportDistribution.forEach(match => {
        sportStats[match.sport] = (sportStats[match.sport] || 0) + 1
      })

      return {
        data: {
          totalMatches: totalMatches || 0,
          todayMatches: todayMatches || 0,
          sportDistribution: sportStats
        },
        error: null
      }
    } catch (error) {
      console.error('获取球局统计失败:', error)
      return { data: null, error: error.message }
    }
  },

  // 删除球局
  async deleteMatch(matchId) {
    try {
      const isAdmin = await this.isAdmin()
      if (!isAdmin) {
        throw new Error('无管理员权限')
      }

      // 先删除球局相关的参与者记录
      const { error: participantsError } = await supabase
        .from('match_participants')
        .delete()
        .eq('match_id', matchId)

      if (participantsError) throw participantsError

      // 再删除球局记录
      const { error: matchError } = await supabase
        .from('matches')
        .delete()
        .eq('id', matchId)

      if (matchError) throw matchError

      return { data: { success: true }, error: null }
    } catch (error) {
      console.error('删除球局失败:', error)
      return { data: null, error: error.message }
    }
  },

  // 检查数据库连接状态
  async checkDatabaseConnection() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('count', { count: 'exact', head: true })
        .limit(1)

      if (error) {
        return { 
          connected: false, 
          error: error.message,
          timestamp: new Date().toISOString()
        }
      }

      return { 
        connected: true, 
        timestamp: new Date().toISOString(),
        tables: ['profiles', 'matches', 'match_participants']
      }
    } catch (error) {
      console.error('数据库连接检查失败:', error)
      return { 
        connected: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }
    }
  }
}