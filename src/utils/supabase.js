import { createClient } from '@supabase/supabase-js'

// Supabase配置 - 支持环境变量和硬编码回退
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nanhthqbcmqxqlqazevm.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hbmh0aHFiY21xeHFscWF6ZXZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNTQzNTQsImV4cCI6MjA3NjgzMDM1NH0.5UkguCPOX6xm9WqZRPFwcMVZS0Lxgc4mVm9vpzoaD1w'

// 验证配置
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase配置错误: 缺少URL或API密钥')
}

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
  // 获取球局列表（优化查询性能）
  async getMatches(filters = {}) {
    try {
      let query = supabase
        .from('matches')
        .select(`
          *,
          creator:profiles!matches_creator_id_fkey(nickname, avatar, pickleball_level, tennis_level, badminton_level),
          participants:match_participants(participant:profiles!match_participants_participant_id_fkey(nickname, avatar))
        `)
        .order('created_at', { ascending: false })

      // 应用筛选条件
      if (filters.sport) {
        query = query.eq('sport', filters.sport)
      }
      if (filters.date) {
        const startDate = new Date(filters.date)
        const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000)
        query = query.gte('time', startDate.toISOString()).lt('time', endDate.toISOString())
      }

      const { data, error } = await query
      
      if (error) {
        console.error('获取球局列表失败:', error)
        return { data: null, error }
      }
      
      return { data, error: null }
    } catch (error) {
      console.error('获取球局列表异常:', error)
      return { data: null, error: new Error('获取球局列表失败') }
    }
  },

  // 创建球局
  async createMatch(matchData) {
    try {
      const { data, error } = await supabase
        .from('matches')
        .insert([matchData])
        .select()
      
      if (error) {
        console.error('创建球局API错误:', error)
        // 如果是RLS错误，提供更友好的提示
        if (error.message.includes('row-level security')) {
          return { data: null, error: new Error('没有权限创建球局，请检查登录状态') }
        }
      }
      
      return { data, error }
    } catch (error) {
      console.error('创建球局异常:', error)
      return { data: null, error }
    }
  },

  // 获取球局详情（包含参与者信息）
  async getMatchDetail(matchId) {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          creator:profiles!matches_creator_id_fkey(*),
          participants:match_participants(
            participant:profiles!match_participants_participant_id_fkey(*)
          ),
          messages:messages!messages_match_id_fkey(
            id,
            content,
            message_type,
            created_at,
            sender:profiles!messages_sender_id_fkey(nickname, avatar)
          )
        `)
        .eq('id', matchId)
        .single()
      
      if (error) {
        console.error('获取球局详情失败:', error)
        return { data: null, error }
      }
      
      return { data, error: null }
    } catch (error) {
      console.error('获取球局详情异常:', error)
      return { data: null, error: new Error('获取球局详情失败') }
    }
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
    try {
      const { error } = await supabase
        .from('match_participants')
        .delete()
        .eq('match_id', matchId)
        .eq('participant_id', userId)
      
      if (error) {
        console.error('退出球局失败:', error)
        return { error }
      }
      
      return { error: null }
    } catch (error) {
      console.error('退出球局异常:', error)
      return { error: new Error('退出球局失败') }
    }
  },

  // 检查用户是否已加入球局
  async checkUserJoined(matchId, userId) {
    try {
      const { data, error } = await supabase
        .from('match_participants')
        .select('id')
        .eq('match_id', matchId)
        .eq('participant_id', userId)
        .single()
      
      return { isJoined: !!data, error }
    } catch (error) {
      return { isJoined: false, error: null }
    }
  }
}

// 实时订阅功能
export const realtimeApi = {
  // 订阅球局变化
  subscribeToMatches(callback) {
    return supabase
      .channel('matches')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'matches' }, 
        callback
      )
      .subscribe()
  },

  // 订阅球局参与者变化
  subscribeToParticipants(matchId, callback) {
    return supabase
      .channel(`match-${matchId}`)
      .on('postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'match_participants',
          filter: `match_id=eq.${matchId}`
        },
        callback
      )
      .subscribe()
  },

  // 订阅球局消息
  subscribeToMessages(matchId, callback) {
    return supabase
      .channel(`messages-${matchId}`)
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`
        },
        callback
      )
      .subscribe()
  }
}

// 消息相关操作
export const messageApi = {
  // 发送消息
  async sendMessage(matchId, senderId, content, messageType = 'text') {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          match_id: matchId,
          sender_id: senderId,
          content: content,
          message_type: messageType
        }])
        .select()
      
      if (error) {
        console.error('发送消息失败:', error)
        return { data: null, error }
      }
      
      return { data, error: null }
    } catch (error) {
      console.error('发送消息异常:', error)
      return { data: null, error: new Error('发送消息失败') }
    }
  },

  // 获取球局消息历史
  async getMessages(matchId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(nickname, avatar)
        `)
        .eq('match_id', matchId)
        .order('created_at', { ascending: false })
        .limit(limit)
      
      if (error) {
        console.error('获取消息失败:', error)
        return { data: null, error }
      }
      
      return { data: data.reverse(), error: null }
    } catch (error) {
      console.error('获取消息异常:', error)
      return { data: null, error: new Error('获取消息失败') }
    }
  }
}

// 通知相关操作
export const notificationApi = {
  // 获取用户通知
  async getNotifications(userId, limit = 20) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)
      
      if (error) {
        console.error('获取通知失败:', error)
        return { data: null, error }
      }
      
      return { data, error: null }
    } catch (error) {
      console.error('获取通知异常:', error)
      return { data: null, error: new Error('获取通知失败') }
    }
  },

  // 标记通知为已读
  async markAsRead(notificationId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
      
      if (error) {
        console.error('标记通知失败:', error)
        return { error }
      }
      
      return { error: null }
    } catch (error) {
      console.error('标记通知异常:', error)
      return { error: new Error('标记通知失败') }
    }
  }
}

export default supabase