import { createClient } from '@supabase/supabase-js'

// Supabase配置 - 新项目
const supabaseUrl = 'https://nanhthqbcmqxqlqazevm.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hbmh0aHFiY21xeHFscWF6ZXZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNTQzNTQsImV4cCI6MjA3NjgzMDM1NH0.5UkguCPOX6xm9WqZRPFwcMVZS0Lxgc4mVm9vpzoaD1w'

// 创建Supabase客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 用户相关操作
export const authApi = {
  // 用户注册
  async signUp(email, password, userData) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })
      
      if (error) {
        console.error('注册失败:', error.message)
        return { data: null, error: this.getErrorMessage(error) }
      }
      
      // 注册成功后自动创建用户资料
      if (data.user) {
        await profileApi.createUserProfile(data.user.id, {
          email: email,
          nickname: userData?.nickname || '新用户',
          ...userData
        })
      }
      
      return { data, error: null }
    } catch (error) {
      console.error('注册异常:', error)
      return { data: null, error: '注册失败，请稍后重试' }
    }
  },

  // 用户登录
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        console.error('登录失败:', error.message)
        return { data: null, error: this.getErrorMessage(error) }
      }
      
      return { data, error: null }
    } catch (error) {
      console.error('登录异常:', error)
      return { data: null, error: '登录失败，请稍后重试' }
    }
  },

  // 获取当前用户
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        console.error('获取用户失败:', error.message)
        return null
      }
      
      return user
    } catch (error) {
      console.error('获取用户异常:', error)
      return null
    }
  },

  // 退出登录
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('退出登录失败:', error.message)
        return { error: this.getErrorMessage(error) }
      }
      
      return { error: null }
    } catch (error) {
      console.error('退出登录异常:', error)
      return { error: '退出登录失败，请稍后重试' }
    }
  },

  // 错误消息处理
  getErrorMessage(error) {
    if (!error) return '未知错误'
    
    const errorMessages = {
      'Invalid login credentials': '邮箱或密码错误',
      'Email not confirmed': '邮箱未验证，请检查您的邮箱',
      'User already registered': '该邮箱已被注册',
      'Weak password': '密码强度不够，请使用更复杂的密码',
      'Network error': '网络连接失败，请检查网络设置'
    }
    
    return errorMessages[error.message] || error.message || '操作失败，请稍后重试'
  }
}

// 用户资料相关操作
export const profileApi = {
  // 获取用户资料
  async getUserProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  // 更新用户资料
  async updateUserProfile(userId, profileData) {
    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', userId)
    return { data, error }
  },

  // 创建用户资料
  async createUserProfile(userId, profileData) {
    const { data, error } = await supabase
      .from('profiles')
      .insert([{ id: userId, ...profileData }])
    return { data, error }
  }
}

// 球局相关操作
export const matchApi = {
  // 获取球局列表
  async getMatches(filters = {}) {
    let query = supabase
      .from('matches')
      .select(`
        *,
        creator:profiles!matches_creator_id_fkey(nickname, avatar, pickleball_level, tennis_level, badminton_level),
        participants:match_participants!inner(participant:profiles!match_participants_participant_id_fkey(nickname, avatar))
      `)
      .order('created_at', { ascending: false })

    // 应用筛选条件
    if (filters.sport) {
      query = query.eq('sport', filters.sport)
    }

    const { data, error } = await query
    return { data, error }
  },

  // 创建球局
  async createMatch(matchData) {
    const { data, error } = await supabase
      .from('matches')
      .insert([matchData])
      .select()
    return { data, error }
  },

  // 获取球局详情
  async getMatchDetail(matchId) {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        creator:profiles!matches_creator_id_fkey(*),
        participants:match_participants(
          participant:profiles!match_participants_participant_id_fkey(*)
        )
      `)
      .eq('id', matchId)
      .single()
    return { data, error }
  },

  // 加入球局
  async joinMatch(matchId, userId) {
    const { data, error } = await supabase
      .from('match_participants')
      .insert([{ match_id: matchId, participant_id: userId }])
    return { data, error }
  },

  // 退出球局
  async leaveMatch(matchId, userId) {
    const { error } = await supabase
      .from('match_participants')
      .delete()
      .eq('match_id', matchId)
      .eq('participant_id', userId)
    return { error }
  }
}

export default supabase