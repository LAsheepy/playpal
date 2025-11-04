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
  // 创建对战 - 使用description字段存储对战数据
  async createBattle(battleData) {
    // 将对战数据序列化存储到description字段
    const battleInfo = {
      type: 'battle',
      parent_match_id: battleData.parent_match_id,
      score_a: battleData.score_a,
      score_b: battleData.score_b,
      winner_team: battleData.winner_team,
      team_a_participants: battleData.team_a_participants || [],
      team_b_participants: battleData.team_b_participants || []
    }
    
    const matchData = {
      title: battleData.title || '对战记录',
      sport: battleData.sport,
      time: battleData.time || new Date().toISOString(),
      location: battleData.location || '对战场地',
      max_players: battleData.max_players || 4,
      creator_id: battleData.creator_id,
      description: JSON.stringify(battleInfo) // 将对战数据存储到description字段
    }
    
    const { data, error } = await supabase
      .from('matches')
      .insert([matchData])
      .select()
    return { data, error }
  },

  // 获取球局的所有对战记录
  async getMatchBattles(matchId) {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        participants:match_participants(
          participant:profiles!match_participants_participant_id_fkey(*),
          team
        )
      `)
      .order('created_at', { ascending: false })
    
    if (error) return { data: null, error }
    
    // 过滤出对战记录（通过解析description字段判断）
    const battleRecords = data.filter(match => {
      try {
        const desc = JSON.parse(match.description || '{}')
        return desc.type === 'battle' && desc.parent_match_id === matchId
      } catch {
        return false
      }
    })
    
    // 处理数据，将参与者按队伍分组
    const processedData = battleRecords.map(battle => {
      const battleInfo = JSON.parse(battle.description || '{}')
      const teamA = battle.participants?.filter(p => p.team === 'A') || []
      const teamB = battle.participants?.filter(p => p.team === 'B') || []
      
      return {
        ...battle,
        ...battleInfo, // 展开对战信息
        team_a: teamA.map(p => ({ participant: p.participant })),
        team_b: teamB.map(p => ({ participant: p.participant }))
      }
    })
    
    return { data: processedData, error: null }
  },

  // 更新对战比分
  async updateBattleScore(battleId, scoreA, scoreB, winnerTeam) {
    // 先获取现有的对战数据
    const { data: existingData, error: fetchError } = await supabase
      .from('matches')
      .select('description')
      .eq('id', battleId)
      .single()
    
    if (fetchError) return { data: null, error: fetchError }
    
    // 解析并更新对战数据
    const battleInfo = JSON.parse(existingData.description || '{}')
    battleInfo.score_a = scoreA
    battleInfo.score_b = scoreB
    battleInfo.winner_team = winnerTeam
    
    const { data, error } = await supabase
      .from('matches')
      .update({
        description: JSON.stringify(battleInfo),
        updated_at: new Date().toISOString()
      })
      .eq('id', battleId)
    return { data, error }
  },

  // 获取用户的胜场统计
  async getUserWinStats(userId) {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        participants:match_participants(
          participant_id,
          team
        )
      `)
    
    if (error) return { data: null, error }
    
    // 过滤出对战记录
    const battleRecords = data.filter(match => {
      try {
        const desc = JSON.parse(match.description || '{}')
        return desc.type === 'battle'
      } catch {
        return false
      }
    })
    
    const userBattles = battleRecords.filter(battle => {
      return battle.participants?.some(p => p.participant_id === userId)
    })
    
    const wins = userBattles.filter(battle => {
      const battleInfo = JSON.parse(battle.description || '{}')
      const userTeam = battle.participants?.find(p => p.participant_id === userId)?.team
      return battleInfo.winner_team === userTeam
    }).length
    
    return { data: { totalBattles: userBattles.length, wins }, error: null }
  }
}

export default supabase