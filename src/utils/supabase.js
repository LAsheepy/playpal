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
        creator:profiles!matches_creator_id_fkey(id, nickname, avatar, pickleball_level, tennis_level, badminton_level),
        participants:match_participants(
          participant:profiles!match_participants_participant_id_fkey(id, nickname, avatar)
        )
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
  async joinMatch(matchId, userId, team = null) {
    const participantData = { match_id: matchId, participant_id: userId }
    if (team) {
      participantData.team = team
    }
    
    const { data, error } = await supabase
      .from('match_participants')
      .insert([participantData])
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

// 对战相关操作
export const battleApi = {
  // 创建对战 - 使用专门的battles表
  async createBattle(battleData) {
    // 创建对战记录
    const battleRecord = {
      match_id: battleData.parent_match_id,
      title: battleData.title || '对战记录',
      sport: battleData.sport,
      time: battleData.time || new Date().toISOString(),
      location: battleData.location || '对战场地',
      score_a: battleData.score_a || 0,
      score_b: battleData.score_b || 0,
      winner_team: battleData.winner_team,
      creator_id: battleData.creator_id
    }
    
    const { data, error } = await supabase
      .from('battles')
      .insert([battleRecord])
      .select()
    
    if (error) return { data: null, error }
    
    // 创建对战参与者记录
    if (data && data[0]) {
      const battleId = data[0].id
      
      // 创建A队参与者记录
      for (const participantId of battleData.team_a_participants || []) {
        await supabase
          .from('battle_participants')
          .insert([{
            battle_id: battleId,
            participant_id: participantId,
            team: 'A'
          }])
      }
      
      // 创建B队参与者记录
      for (const participantId of battleData.team_b_participants || []) {
        await supabase
          .from('battle_participants')
          .insert([{
            battle_id: battleId,
            participant_id: participantId,
            team: 'B'
          }])
      }
    }
    
    return { data, error }
  },

  // 获取球局的所有对战记录
  async getMatchBattles(matchId) {
    const { data, error } = await supabase
      .from('battles')
      .select(`
        *,
        creator:profiles!battles_creator_id_fkey(nickname, avatar),
        participants:battle_participants(
          participant:profiles!battle_participants_participant_id_fkey(nickname, avatar),
          team
        )
      `)
      .eq('match_id', matchId)
      .order('created_at', { ascending: false })
    
    if (error) return { data: null, error }
    
    // 处理数据，将参与者按队伍分组
    const processedData = data.map(battle => {
      const teamA = battle.participants?.filter(p => p.team === 'A') || []
      const teamB = battle.participants?.filter(p => p.team === 'B') || []
      
      return {
        ...battle,
        team_a: teamA.map(p => ({ participant: p.participant })),
        team_b: teamB.map(p => ({ participant: p.participant }))
      }
    })
    
    return { data: processedData, error: null }
  },

  // 更新对战比分
  async updateBattleScore(battleId, scoreA, scoreB, winnerTeam) {
    const { data, error } = await supabase
      .from('battles')
      .update({
        score_a: scoreA,
        score_b: scoreB,
        winner_team: winnerTeam,
        updated_at: new Date().toISOString()
      })
      .eq('id', battleId)
    return { data, error }
  },

  // 获取用户的胜场统计
  async getUserWinStats(userId) {
    const { data, error } = await supabase
      .from('battles')
      .select(`
        *,
        participants:battle_participants(
          participant_id,
          team
        )
      `)
    
    if (error) return { data: null, error }
    
    const userBattles = data.filter(battle => {
      return battle.participants?.some(p => p.participant_id === userId)
    })
    
    const wins = userBattles.filter(battle => {
      const userTeam = battle.participants?.find(p => p.participant_id === userId)?.team
      return battle.winner_team === userTeam
    }).length
    
    return { data: { totalBattles: userBattles.length, wins }, error: null }
  }
}

// 反馈相关操作
export const feedbackApi = {
  // 提交反馈
  async submitFeedback(feedbackData) {
    const { data, error } = await supabase
      .from('feedbacks')
      .insert([feedbackData])
      .select()
    
    if (error) {
      console.error('提交反馈失败:', error)
      return { data: null, error: this.getErrorMessage(error) }
    }
    
    return { data, error: null }
  },

  // 获取用户反馈列表
  async getUserFeedbacks(userId) {
    const { data, error } = await supabase
      .from('feedbacks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('获取用户反馈失败:', error)
      return { data: null, error }
    }
    
    return { data, error: null }
  },

  // 获取所有反馈（管理员用）
  async getAllFeedbacks() {
    const { data, error } = await supabase
      .from('feedbacks')
      .select(`
        *,
        user:profiles(nickname, email)
      `)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('获取反馈列表失败:', error)
      return { data: null, error }
    }
    
    return { data, error: null }
  },

  // 更新反馈状态
  async updateFeedbackStatus(feedbackId, status) {
    const { data, error } = await supabase
      .from('feedbacks')
      .update({ 
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', feedbackId)
    
    if (error) {
      console.error('更新反馈状态失败:', error)
      return { data: null, error }
    }
    
    return { data, error: null }
  },

  // 获取反馈统计
  async getFeedbackStats() {
    const { data, error } = await supabase
      .from('feedbacks')
      .select('status')
    
    if (error) {
      console.error('获取反馈统计失败:', error)
      return { data: null, error }
    }
    
    const stats = {
      total: data.length,
      pending: data.filter(f => f.status === 'pending').length,
      resolved: data.filter(f => f.status === 'resolved').length
    }
    
    return { data: stats, error: null }
  },

  // 错误消息处理
  getErrorMessage(error) {
    if (!error) return '未知错误'
    
    const errorMessages = {
      'Network error': '网络连接失败，请检查网络设置',
      'insert or update on table "feedbacks" violates foreign key constraint': '用户不存在'
    }
    
    return errorMessages[error.message] || error.message || '操作失败，请稍后重试'
  }
}

export default supabase