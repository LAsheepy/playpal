import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../utils/supabase'
import { useUserStore } from './user'

export const useLeaderboardStore = defineStore('leaderboard', () => {
  const userStore = useUserStore()
  
  // 排行榜数据
  const leaderboardData = ref([])
  
  // 加载状态
  const isLoading = ref(false)
  
  // 错误信息
  const errorMessage = ref('')
  
  // 实时订阅句柄
  let subscription = null

  // 计算用户胜率统计
  const calculateUserStats = async () => {
    try {
      // 查询所有用户的对战记录
      const { data: battlesData, error } = await supabase
        .from('battles')
        .select(`
          *,
          participants:battle_participants(
            participant_id,
            team
          )
        `)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('获取对战数据失败:', error)
        throw error
      }
      
      if (!battlesData || battlesData.length === 0) {
        console.log('没有对战数据，返回空排行榜')
        return []
      }
      
      // 统计每个用户的对战数据
      const userStatsMap = new Map()
      
      battlesData.forEach(battle => {
        if (!battle.participants) return
        
        battle.participants.forEach(participant => {
          const userId = participant.participant_id
          if (!userId) return
          
          if (!userStatsMap.has(userId)) {
            userStatsMap.set(userId, {
              userId: userId,
              totalBattles: 0,
              wins: 0,
              losses: 0
            })
          }
          
          const userStats = userStatsMap.get(userId)
          userStats.totalBattles++
          
          // 计算胜负
          const userTeam = participant.team
          if (battle.winner_team === userTeam) {
            userStats.wins++
          } else {
            userStats.losses++
          }
        })
      })
      
      // 获取用户详细信息
      const userIds = Array.from(userStatsMap.keys())
      if (userIds.length === 0) {
        return []
      }
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, nickname, avatar, email')
        .in('id', userIds)
      
      if (profilesError) {
        console.error('获取用户资料失败:', profilesError)
        throw profilesError
      }
      
      // 合并用户资料和统计数据
      const leaderboardResults = []
      
      userStatsMap.forEach((stats, userId) => {
        const profile = profilesData.find(p => p.id === userId)
        if (!profile) return
        
        const winRate = stats.totalBattles > 0 
          ? Math.round((stats.wins / stats.totalBattles) * 100) 
          : 0
        
        leaderboardResults.push({
          rank: 0, // 稍后排序
          userId: userId,
          nickname: profile.nickname || '未知用户',
          avatar: profile.avatar || '',
          email: profile.email,
          totalBattles: stats.totalBattles,
          wins: stats.wins,
          losses: stats.losses,
          winRate: winRate,
          score: calculateScore(stats.wins, stats.totalBattles)
        })
      })
      
      // 按胜率和总场次排序
      leaderboardResults.sort((a, b) => {
        if (a.score !== b.score) {
          return b.score - a.score
        }
        return b.totalBattles - a.totalBattles
      })
      
      // 设置排名
      leaderboardResults.forEach((user, index) => {
        user.rank = index + 1
      })
      
      return leaderboardResults
    } catch (error) {
      console.error('计算排行榜数据失败:', error)
      throw error
    }
  }
  
  // 计算综合得分（胜率权重 + 场次权重）
  const calculateScore = (wins, totalBattles) => {
    if (totalBattles === 0) return 0
    
    const winRate = wins / totalBattles
    // 胜率权重70% + 场次权重30%（归一化处理）
    const normalizedBattles = Math.min(totalBattles / 50, 1) // 假设50场为参考标准
    return winRate * 0.7 + normalizedBattles * 0.3
  }

  // 加载排行榜数据
  const loadLeaderboard = async () => {
    try {
      isLoading.value = true
      errorMessage.value = ''
      
      const results = await calculateUserStats()
      leaderboardData.value = results
      
      console.log('排行榜数据加载成功:', results.length, '个用户')
      return { success: true }
    } catch (error) {
      console.error('加载排行榜失败:', error)
      errorMessage.value = '加载排行榜数据失败，请检查网络连接'
      return { success: false, error: errorMessage.value }
    } finally {
      isLoading.value = false
    }
  }

  // 设置实时订阅
  const setupRealtimeSubscription = () => {
    if (subscription) {
      // 如果已有订阅，先取消
      supabase.removeSubscription(subscription)
    }
    
    // 订阅对战表的实时更新
    subscription = supabase
      .channel('leaderboard-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'battles'
        },
        (payload) => {
          console.log('收到对战表更新，重新加载排行榜')
          loadLeaderboard()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'battle_participants'
        },
        (payload) => {
          console.log('收到对战参与者表更新，重新加载排行榜')
          loadLeaderboard()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('收到用户资料更新，重新加载排行榜')
          loadLeaderboard()
        }
      )
      .subscribe((status) => {
        console.log('排行榜实时订阅状态:', status)
      })
  }

  // 初始化排行榜
  const initLeaderboard = () => {
    loadLeaderboard()
    setupRealtimeSubscription()
  }

  // 获取当前用户的排名
  const getCurrentUserRank = computed(() => {
    if (!userStore.isLoggedIn || !userStore.userInfo.id) {
      return null
    }
    
    const userRank = leaderboardData.value.find(user => user.userId === userStore.userInfo.id)
    return userRank ? {
      rank: userRank.rank,
      winRate: userRank.winRate,
      totalBattles: userRank.totalBattles
    } : null
  })

  // 获取前三名用户
  const topThreeUsers = computed(() => {
    return leaderboardData.value.slice(0, 3)
  })

  // 获取第四名及以后的用户
  const otherUsers = computed(() => {
    return leaderboardData.value.slice(3)
  })

  // 清除错误信息
  const clearError = () => {
    errorMessage.value = ''
  }

  // 监听用户登录状态变化
  const initUserListener = () => {
    userStore.$subscribe((mutation, state) => {
      if (state.isLoggedIn) {
        initLeaderboard()
      } else {
        leaderboardData.value = []
        if (subscription) {
          supabase.removeSubscription(subscription)
          subscription = null
        }
      }
    })
  }
  
  // 初始化
  initLeaderboard()
  initUserListener()

  return {
    leaderboardData,
    topThreeUsers,
    otherUsers,
    getCurrentUserRank,
    isLoading,
    errorMessage,
    loadLeaderboard,
    clearError
  }
})