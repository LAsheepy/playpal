import { defineStore } from 'pinia'
import { ref } from 'vue'
import { matchApi } from '../utils/supabase'
import { useUserStore } from './user'

export const useMatchStore = defineStore('match', () => {
  const userStore = useUserStore()
  
  // 球局列表
  const matchList = ref([])
  
  // 当前筛选条件
  const filter = ref({
    sport: '',
    date: '',
    level: ''
  })
  
  // 加载状态
  const isLoading = ref(false)
  
  // 错误信息
  const errorMessage = ref('')

  // 加载球局列表
  const loadMatches = async () => {
    try {
      isLoading.value = true
      errorMessage.value = ''
      
      const { data, error } = await matchApi.getMatches(filter.value)
      if (error) {
        errorMessage.value = '加载球局失败，请检查网络连接'
        throw error
      }
      
      // 转换数据格式
      matchList.value = data.map(match => ({
        id: match.id,
        title: match.title,
        sport: match.sport,
        time: match.time,
        location: match.location,
        maxPlayers: match.max_players,
        currentPlayers: match.participants?.length || 1,
        creator: {
          id: match.creator.id,
          nickname: match.creator.nickname,
          avatar: match.creator.avatar,
          level: match.creator.pickleball_level || match.creator.tennis_level || match.creator.badminton_level || '初级'
        },
        description: match.description,
        participants: match.participants?.map(p => ({
          id: p.participant.id,
          nickname: p.participant.nickname,
          avatar: p.participant.avatar,
          level: p.participant.pickleball_level || p.participant.tennis_level || p.participant.badminton_level || '初级'
        })) || []
      }))
      
      return { success: true }
    } catch (error) {
      console.error('加载球局失败:', error)
      return { success: false, error: errorMessage.value || '加载球局失败' }
    } finally {
      isLoading.value = false
    }
  }

  // 创建球局
  const createMatch = async (matchData) => {
    try {
      isLoading.value = true
      errorMessage.value = ''
      
      if (!userStore.isLoggedIn) {
        throw new Error('请先登录后再创建球局')
      }
      
      // 确保时间格式正确（转换为ISO字符串）
      const matchTime = new Date(matchData.time).toISOString()
      
      const matchToCreate = {
        title: matchData.title,
        sport: matchData.sport,
        time: matchTime,
        location: matchData.location,
        max_players: matchData.maxPlayers,
        description: matchData.description,
        creator_id: userStore.userInfo.id
      }
      
      const { data, error } = await matchApi.createMatch(matchToCreate)
      if (error) {
        errorMessage.value = '创建球局失败，请检查网络连接'
        throw error
      }
      
      // 重新加载球局列表
      await loadMatches()
      
      return { success: true, data: data[0] }
    } catch (error) {
      console.error('创建球局失败:', error)
      return { success: false, error: errorMessage.value || '创建球局失败' }
    } finally {
      isLoading.value = false
    }
  }

  // 加入球局
  const joinMatch = async (matchId) => {
    try {
      isLoading.value = true
      errorMessage.value = ''
      
      if (!userStore.isLoggedIn) {
        throw new Error('请先登录后再加入球局')
      }
      
      const { error } = await matchApi.joinMatch(matchId, userStore.userInfo.id)
      if (error) {
        errorMessage.value = '加入球局失败，请检查网络连接'
        throw error
      }
      
      // 重新加载球局列表
      await loadMatches()
      
      return { success: true }
    } catch (error) {
      console.error('加入球局失败:', error)
      return { success: false, error: errorMessage.value || '加入球局失败' }
    } finally {
      isLoading.value = false
    }
  }

  // 退出球局
  const leaveMatch = async (matchId) => {
    try {
      isLoading.value = true
      errorMessage.value = ''
      
      if (!userStore.isLoggedIn) {
        throw new Error('请先登录后再退出球局')
      }
      
      const { error } = await matchApi.leaveMatch(matchId, userStore.userInfo.id)
      if (error) {
        errorMessage.value = '退出球局失败，请检查网络连接'
        throw error
      }
      
      // 重新加载球局列表
      await loadMatches()
      
      return { success: true }
    } catch (error) {
      console.error('退出球局失败:', error)
      return { success: false, error: errorMessage.value || '退出球局失败' }
    } finally {
      isLoading.value = false
    }
  }

  // 获取球局详情
  const getMatchDetail = async (matchId) => {
    try {
      isLoading.value = true
      errorMessage.value = ''
      
      const { data, error } = await matchApi.getMatchDetail(matchId)
      if (error) {
        errorMessage.value = '获取球局详情失败，请检查网络连接'
        throw error
      }
      
      return {
        success: true,
        data: {
          id: data.id,
          title: data.title,
          sport: data.sport,
          time: data.time,
          location: data.location,
          maxPlayers: data.max_players,
          currentPlayers: data.participants?.length || 1,
          creator: {
            id: data.creator.id,
            nickname: data.creator.nickname,
            avatar: data.creator.avatar,
            level: data.creator.pickleball_level || data.creator.tennis_level || data.creator.badminton_level || '初级'
          },
          description: data.description,
          participants: data.participants?.map(p => ({
            id: p.participant.id,
            nickname: p.participant.nickname,
            avatar: p.participant.avatar,
            level: p.participant.pickleball_level || p.participant.tennis_level || p.participant.badminton_level || '初级'
          })) || []
        }
      }
    } catch (error) {
      console.error('获取球局详情失败:', error)
      return { success: false, error: errorMessage.value || '获取球局详情失败' }
    } finally {
      isLoading.value = false
    }
  }

  // 更新筛选条件
  const updateFilter = (newFilter) => {
    filter.value = { ...filter.value, ...newFilter }
    loadMatches()
  }

  // 获取筛选后的球局列表
  const getFilteredMatches = () => {
    return matchList.value.filter(match => {
      if (filter.value.sport && match.sport !== filter.value.sport) return false
      if (filter.value.level && match.creator.level !== filter.value.level) return false
      if (filter.value.date && !match.time.includes(filter.value.date)) return false
      return true
    })
  }

  // 清除错误信息
  const clearError = () => {
    errorMessage.value = ''
  }

  // 初始化加载球局
  loadMatches()

  return {
    matchList,
    filter,
    isLoading,
    errorMessage,
    loadMatches,
    createMatch,
    joinMatch,
    leaveMatch,
    getMatchDetail,
    updateFilter,
    getFilteredMatches,
    clearError
  }
})