import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { battleApi, supabase } from '../utils/supabase'
import { useUserStore } from './user'

export const useHistoryStore = defineStore('history', () => {
  const userStore = useUserStore()
  
  // 历史记录列表
  const historyRecords = ref([])
  
  // 加载状态
  const isLoading = ref(false)
  
  // 错误信息
  const errorMessage = ref('')
  
  // 实时订阅句柄
  let subscription = null

  // 加载历史记录
  const loadHistoryRecords = async () => {
    try {
      // 检查登录状态
      if (!userStore.isLoggedIn) {
        console.log('用户未登录，跳过加载历史记录')
        historyRecords.value = []
        return { success: true }
      }
      
      isLoading.value = true
      errorMessage.value = ''
      
      // 查询用户参与的所有对战记录，包括详细的参与者信息
      const { data: battlesData, error: battlesError } = await supabase
        .from('battles')
        .select(`
          *,
          creator:profiles!battles_creator_id_fkey(nickname, avatar),
          participants:battle_participants!inner(
            participant_id,
            team,
            participant:profiles!battle_participants_participant_id_fkey(nickname, avatar)
          ),
          match:matches!battles_match_id_fkey(title, sport, location, max_players)
        `)
        .eq('participants.participant_id', userStore.userInfo.id)
        .order('created_at', { ascending: false })
      
      if (battlesError) {
        console.error('获取对战详情失败:', battlesError)
        errorMessage.value = '加载历史记录失败，请检查网络连接'
        throw battlesError
      }
      
      // 按球局(match_id)分组对战记录
      const matchGroups = {}
      
      battlesData.forEach(battle => {
        const matchId = battle.match_id
        if (!matchGroups[matchId]) {
          matchGroups[matchId] = {
            matchId: matchId,
            title: battle.match?.title || battle.title || '球局对战',
            sport: battle.sport,
            location: battle.location || battle.match?.location || '未知场地',
            date: battle.time,
            battles: [],
            participants: new Set(),
            teamA: new Set(),
            teamB: new Set()
          }
        }
        
        // 添加当前对战信息
        const userTeam = battle.participants?.find(p => p.participant_id === userStore.userInfo.id)?.team
        const isWinner = battle.winner_team === userTeam
        
        // 收集参与者信息
        battle.participants?.forEach(p => {
          matchGroups[matchId].participants.add(p.participant_id)
          if (p.team === 'A') {
            matchGroups[matchId].teamA.add(p.participant_id)
          } else if (p.team === 'B') {
            matchGroups[matchId].teamB.add(p.participant_id)
          }
        })
        
        matchGroups[matchId].battles.push({
          id: battle.id,
          score: `${battle.score_a || 0}-${battle.score_b || 0}`,
          result: isWinner ? 'win' : 'loss',
          winnerTeam: battle.winner_team,
          time: battle.time
        })
      })
      
      // 转换为最终的历史记录格式
      historyRecords.value = Object.values(matchGroups).map(group => {
        // 获取对手信息（与当前用户不同队伍的参与者）
        const userTeam = group.battles[0]?.result === 'win' ? group.battles[0].winnerTeam : 
                        (group.battles[0]?.result === 'loss' ? (group.battles[0].winnerTeam === 'A' ? 'B' : 'A') : 'A')
        
        const opponentTeam = userTeam === 'A' ? 'B' : 'A'
        const opponentIds = opponentTeam === 'A' ? Array.from(group.teamA) : Array.from(group.teamB)
        
        // 获取对手名称（从battles数据中查找）
        const opponentNames = []
        battlesData.forEach(battle => {
          if (battle.match_id === group.matchId) {
            battle.participants?.forEach(p => {
              if (p.participant_id !== userStore.userInfo.id && 
                  opponentIds.includes(p.participant_id) &&
                  p.participant?.nickname) {
                opponentNames.push(p.participant.nickname)
              }
            })
          }
        })
        
        // 去重对手名称
        const uniqueOpponentNames = [...new Set(opponentNames)]
        
        // 计算总胜场数
        const totalWins = group.battles.filter(battle => battle.result === 'win').length
        const totalBattles = group.battles.length
        
        return {
          id: group.matchId, // 使用球局ID作为唯一标识
          sport: group.sport,
          date: group.date,
          title: group.title,
          location: group.location,
          participants: Array.from(group.participants).length,
          result: totalWins > totalBattles / 2 ? 'win' : 'loss',
          score: `${totalWins}-${totalBattles - totalWins}`,
          teamA: Array.from(group.teamA).length,
          teamB: Array.from(group.teamB).length,
          battles: group.battles,
          opponentNames: uniqueOpponentNames,
          totalBattles: totalBattles,
          wins: totalWins,
          isGrouped: true // 标记为合并记录
        }
      })
      
      console.log('成功加载历史记录:', historyRecords.value.length, '个球局')
      return { success: true }
    } catch (error) {
      console.error('加载历史记录失败:', error)
      return { success: false, error: errorMessage.value || '加载历史记录失败' }
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
      .channel('battles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'battles'
        },
        (payload) => {
          console.log('收到对战表更新:', payload)
          
          // 重新加载历史记录
          loadHistoryRecords()
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
          console.log('收到对战参与者表更新:', payload)
          
          // 重新加载历史记录
          loadHistoryRecords()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches'
        },
        (payload) => {
          console.log('收到球局表更新:', payload)
          
          // 重新加载历史记录
          loadHistoryRecords()
        }
      )
      .subscribe((status) => {
        console.log('实时订阅状态:', status)
      })
  }

  // 初始化历史记录
  const initHistory = () => {
    if (userStore.isLoggedIn) {
      loadHistoryRecords()
      setupRealtimeSubscription()
    }
  }

  // 清除错误信息
  const clearError = () => {
    errorMessage.value = ''
  }

  // 计算属性：按日期分组的历史记录
  const groupedHistoryRecords = computed(() => {
    const groups = {}
    
    historyRecords.value.forEach(record => {
      const date = new Date(record.date).toLocaleDateString('zh-CN')
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(record)
    })
    
    return groups
  })

  // 计算属性：统计信息
  const stats = computed(() => {
    const total = historyRecords.value.length
    const wins = historyRecords.value.filter(record => record.result === 'win').length
    const winRate = total > 0 ? Math.round((wins / total) * 100) : 0
    
    return {
      total,
      wins,
      winRate
    }
  })

  // 监听用户登录状态变化
  const initUserListener = () => {
    // 当用户登录状态改变时重新初始化
    userStore.$subscribe((mutation, state) => {
      if (state.isLoggedIn) {
        initHistory()
      } else {
        historyRecords.value = []
        if (subscription) {
          supabase.removeSubscription(subscription)
          subscription = null
        }
      }
    })
  }
  
  // 初始化
  initHistory()
  initUserListener()

  return {
    historyRecords,
    groupedHistoryRecords,
    isLoading,
    errorMessage,
    stats,
    loadHistoryRecords,
    clearError
  }
})