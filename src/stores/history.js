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
      
      // 直接查询用户参与的对战记录
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
          match:matches!battles_match_id_fkey(title, sport, location)
        `)
        .eq('participants.participant_id', userStore.userInfo.id)
        .order('created_at', { ascending: false })
      
      if (battlesError) {
        console.error('获取对战详情失败:', battlesError)
        errorMessage.value = '加载历史记录失败，请检查网络连接'
        throw battlesError
      }
      
      // 转换数据格式
      historyRecords.value = battlesData.map(battle => {
        const userTeam = battle.participants?.find(p => p.participant_id === userStore.userInfo.id)?.team
        const isWinner = battle.winner_team === userTeam
        
        // 获取参与者信息
        const participants = battle.participants?.map(p => ({
          id: p.participant_id,
          name: p.participant?.nickname || '未知用户',
          avatar: p.participant?.avatar || '',
          team: p.team
        })) || []
        
        // 按队伍分组参与者
        const teamA = participants.filter(p => p.team === 'A')
        const teamB = participants.filter(p => p.team === 'B')
        
        return {
          id: battle.id,
          sport: battle.sport,
          date: battle.time,
          title: battle.title || battle.match?.title || '对战记录',
          location: battle.location || battle.match?.location || '未知场地',
          participants: participants,
          result: isWinner ? 'win' : 'loss',
          score: `${battle.score_a || 0}-${battle.score_b || 0}`,
          teamA: teamA,
          teamB: teamB,
          creator: battle.creator,
          matchTitle: battle.match?.title,
          createdAt: battle.created_at
        }
      })
      
      console.log('成功加载历史记录:', historyRecords.value.length)
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
      .subscribe()
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