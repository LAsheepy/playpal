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
      // 检查登录状态
      if (!userStore.isLoggedIn) {
        console.log('用户未登录，跳过加载球局数据')
        matchList.value = []
        return { success: true }
      }
      
      isLoading.value = true
      errorMessage.value = ''
      
      const { data, error } = await matchApi.getMatches(filter.value)
      if (error) {
        console.error('API调用错误:', error)
        errorMessage.value = '加载球局失败，请检查网络连接'
        throw error
      }
      
      // 检查数据是否为空
      if (!data || data.length === 0) {
        console.log('没有找到球局数据，表可能为空')
        matchList.value = []
        return { success: true }
      }
      
      // 转换数据格式，添加空值检查
      matchList.value = data.map(match => {
        // 确保creator对象存在
        const creator = match.creator || {}
        // 确保participants数组存在
        const participants = match.participants || []
        
        return {
          id: match.id,
          title: match.title,
          sport: match.sport,
          time: match.time,
          location: match.location,
          maxPlayers: match.max_players,
          currentPlayers: participants.length || 1,
          creator: {
            id: creator.id || 'unknown',
            nickname: creator.nickname || '未知用户',
            avatar: creator.avatar || '',
            level: creator.pickleball_level || creator.tennis_level || creator.badminton_level || '初级'
          },
          description: match.description || '',
          participants: participants.map(p => {
            const participant = p.participant || {}
            return {
              id: participant.id || 'unknown',
              nickname: participant.nickname || '未知用户',
              avatar: participant.avatar || '',
              level: participant.pickleball_level || participant.tennis_level || participant.badminton_level || '初级'
            }
          })
        }
      })
      
      console.log('成功加载球局数据:', matchList.value.length)
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
      
      // 验证用户登录状态
      if (!userStore.isLoggedIn) {
        errorMessage.value = '请先登录后再创建球局'
        throw new Error(errorMessage.value)
      }
      
      // 游客模式下不允许创建球局
      if (userStore.isGuestMode) {
        errorMessage.value = '游客模式下无法创建球局，请注册账号后使用完整功能'
        throw new Error(errorMessage.value)
      }
      
      // 验证用户ID
      if (!userStore.userInfo.id) {
        errorMessage.value = '用户信息不完整，请重新登录'
        throw new Error(errorMessage.value)
      }
      
      // 验证必填字段 - 添加详细调试信息
      console.log('=== match store验证必填字段 ===')
      console.log('title:', matchData.title, '类型:', typeof matchData.title)
      console.log('sport:', matchData.sport, '类型:', typeof matchData.sport)
      console.log('time:', matchData.time, '类型:', typeof matchData.time)
      console.log('location:', matchData.location, '类型:', typeof matchData.location)
      console.log('max_players:', matchData.max_players, '类型:', typeof matchData.max_players)
      
      if (!matchData.title || !matchData.sport || !matchData.time || !matchData.location || !matchData.max_players) {
        console.log('❌ 验证失败: 字段不完整')
        errorMessage.value = '请完善所有必填信息'
        throw new Error(errorMessage.value)
      }
      
      console.log('✅ match store验证通过')
      
      // 确保时间格式正确（转换为ISO字符串）
      const matchTime = new Date(matchData.time)
      if (isNaN(matchTime.getTime())) {
        errorMessage.value = '时间格式无效'
        throw new Error(errorMessage.value)
      }
      
      const matchToCreate = {
        title: matchData.title.trim(),
        sport: matchData.sport,
        time: matchTime.toISOString(),
        location: matchData.location.trim(),
        max_players: parseInt(matchData.max_players),
        description: matchData.description ? matchData.description.trim() : '',
        creator_id: userStore.userInfo.id
      }
      
      // 验证数据完整性
      if (matchToCreate.title.length < 2 || matchToCreate.title.length > 50) {
        errorMessage.value = '球局标题长度应在2-50个字符之间'
        throw new Error(errorMessage.value)
      }
      
      if (matchToCreate.location.length < 2 || matchToCreate.location.length > 100) {
        errorMessage.value = '地点长度应在2-100个字符之间'
        throw new Error(errorMessage.value)
      }
      
      if (matchToCreate.max_players < 1 || matchToCreate.max_players > 12) {
        errorMessage.value = '人数上限应在1-12人之间'
        throw new Error(errorMessage.value)
      }
      
      if (matchToCreate.description && matchToCreate.description.length > 200) {
        errorMessage.value = '描述长度不能超过200个字符'
        throw new Error(errorMessage.value)
      }
      
      const { data, error } = await matchApi.createMatch(matchToCreate)
      if (error) {
        console.error('创建球局API错误:', error)
        
        // 根据错误类型提供更友好的提示
        if (error.message.includes('row-level security')) {
          errorMessage.value = '没有权限创建球局，请检查登录状态'
        } else if (error.message.includes('network') || error.message.includes('Network')) {
          errorMessage.value = '网络连接失败，请检查网络设置'
        } else if (error.message.includes('profiles')) {
          errorMessage.value = '用户资料不存在，请先完善个人资料'
        } else {
          errorMessage.value = '创建球局失败，请稍后重试'
        }
        
        throw error
      }
      
      if (!data || data.length === 0) {
        errorMessage.value = '创建球局失败，未返回有效数据'
        throw new Error(errorMessage.value)
      }
      
      // 重新加载球局列表
      await loadMatches()
      
      return { success: true, data: data[0] }
    } catch (error) {
      console.error('创建球局失败:', error)
      return { 
        success: false, 
        error: errorMessage.value || error.message || '创建球局失败' 
      }
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
      
      // 游客模式下不允许加入球局
      if (userStore.isGuestMode) {
        throw new Error('游客模式下无法加入球局，请注册账号后使用完整功能')
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

  // 游客模式下的球局浏览（只读）
  const browseMatches = async () => {
    try {
      isLoading.value = true
      errorMessage.value = ''
      
      const { data, error } = await matchApi.getMatches(filter.value)
      if (error) {
        errorMessage.value = '加载球局失败，请检查网络连接'
        throw error
      }
      
      // 转换数据格式，但标记为只读模式
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
        })) || [],
        isReadOnly: true // 标记为只读模式
      }))
      
      return { success: true }
    } catch (error) {
      console.error('浏览球局失败:', error)
      return { success: false, error: errorMessage.value || '浏览球局失败' }
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
      
      // 游客模式下不允许退出球局
      if (userStore.isGuestMode) {
        throw new Error('游客模式下无法退出球局')
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
      
      if (!data) {
        errorMessage.value = '球局不存在'
        throw new Error('球局不存在')
      }
      
      // 添加详细调试信息
      console.log('=== 获取球局详情数据 ===')
      console.log('原始数据:', data)
      console.log('creator数据:', data.creator)
      console.log('participants数据:', data.participants)
      
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
            id: data.creator?.id || 'unknown',
            nickname: data.creator?.nickname || '未知用户',
            avatar: data.creator?.avatar || '',
            level: data.creator?.pickleball_level || data.creator?.tennis_level || data.creator?.badminton_level || '初级'
          },
          description: data.description,
          participants: data.participants?.map(p => ({
            id: p.participant?.id || 'unknown',
            nickname: p.participant?.nickname || '未知用户',
            avatar: p.participant?.avatar || '',
            level: p.participant?.pickleball_level || p.participant?.tennis_level || p.participant?.badminton_level || '初级'
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
    
    // 只有在登录状态下才加载数据
    if (userStore.isLoggedIn && !userStore.isGuestMode) {
      loadMatches()
    }
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

  // 初始化加载球局（仅在登录状态下）
  const initMatches = () => {
    if (userStore.isLoggedIn && !userStore.isGuestMode) {
      loadMatches()
    }
  }
  
  // 监听登录状态变化
  const initUserListener = () => {
    // 这里可以添加对用户状态变化的监听
    // 当用户登录状态改变时重新加载数据
  }
  
  initMatches()

  return {
    matchList,
    filter,
    isLoading,
    errorMessage,
    loadMatches,
    browseMatches,
    createMatch,
    joinMatch,
    leaveMatch,
    getMatchDetail,
    updateFilter,
    getFilteredMatches,
    clearError
  }
})