import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authApi, profileApi } from '../utils/supabase'

export const useUserStore = defineStore('user', () => {
  // 用户信息
  const userInfo = ref({
    id: null,
    email: '',
    nickname: '新用户',
    avatar: '',
    age: null,
    gender: '',
    pickleballLevel: '',
    tennisLevel: '',
    badmintonLevel: '',
    bio: ''
  })

  // 登录状态
  const isLoggedIn = ref(false)
  
  // 加载状态
  const isLoading = ref(false)
  
  // 错误信息
  const errorMessage = ref('')

  // 初始化用户状态
  const initUser = async () => {
    try {
      isLoading.value = true
      errorMessage.value = ''
      
      const user = await authApi.getCurrentUser()
      if (user) {
        const { data: profile, error } = await profileApi.getUserProfile(user.id)
        if (error) {
          console.error('获取用户资料失败:', error)
          // 如果用户存在但资料不存在，创建默认资料
          if (error.message.includes('not found')) {
            await createDefaultProfile(user)
          }
        } else if (profile) {
          // 映射数据库字段到前端字段
          userInfo.value = { 
            ...userInfo.value, 
            id: profile.id,
            email: profile.email,
            nickname: profile.nickname,
            avatar: profile.avatar,
            age: profile.age,
            gender: profile.gender,
            pickleballLevel: profile.pickleball_level,
            tennisLevel: profile.tennis_level,
            badmintonLevel: profile.badminton_level,
            bio: profile.bio
          }
          isLoggedIn.value = true
          localStorage.setItem('isLoggedIn', 'true')
        }
      }
    } catch (error) {
      console.error('初始化用户失败:', error)
      errorMessage.value = '初始化用户信息失败'
    } finally {
      isLoading.value = false
    }
  }

  // 创建默认用户资料
  const createDefaultProfile = async (user) => {
    try {
      const profileData = {
        email: user.email,
        nickname: user.email.split('@')[0] || '新用户',
        avatar: '',
        bio: '这个人很懒，什么都没有写'
      }
      
      const { error } = await profileApi.createUserProfile(user.id, profileData)
      if (error) throw error
      
      userInfo.value = { ...userInfo.value, ...profileData, id: user.id }
      isLoggedIn.value = true
      localStorage.setItem('isLoggedIn', 'true')
    } catch (error) {
      console.error('创建默认资料失败:', error)
      throw error
    }
  }

  // 登录
  const login = async (email, password) => {
    try {
      isLoading.value = true
      errorMessage.value = ''
      
      const { data, error } = await authApi.signIn(email, password)
      if (error) {
        errorMessage.value = error
        throw error
      }
      
      if (data.user) {
        const { data: profile, error: profileError } = await profileApi.getUserProfile(data.user.id)
        if (profileError) {
          // 如果用户存在但资料不存在，创建默认资料
          if (profileError.message.includes('not found')) {
            await createDefaultProfile(data.user)
          } else {
            throw profileError
          }
        } else if (profile) {
          // 映射数据库字段到前端字段
          userInfo.value = { 
            ...userInfo.value, 
            id: profile.id,
            email: profile.email,
            nickname: profile.nickname,
            avatar: profile.avatar,
            age: profile.age,
            gender: profile.gender,
            pickleballLevel: profile.pickleball_level,
            tennisLevel: profile.tennis_level,
            badmintonLevel: profile.badminton_level,
            bio: profile.bio
          }
          isLoggedIn.value = true
          localStorage.setItem('isLoggedIn', 'true')
        }
      }
      
      return { success: true }
    } catch (error) {
      console.error('登录失败:', error)
      errorMessage.value = error || '登录失败，请检查邮箱和密码'
      return { success: false, error: errorMessage.value }
    } finally {
      isLoading.value = false
    }
  }

  // 注册
  const register = async (email, password, userData = {}) => {
    try {
      isLoading.value = true
      errorMessage.value = ''
      
      const { data, error } = await authApi.signUp(email, password, userData)
      if (error) {
        errorMessage.value = error
        throw error
      }
      
      if (data.user) {
        // 创建用户资料
        const profileData = {
          email: data.user.email,
          nickname: userData.nickname || data.user.email.split('@')[0],
          avatar: '',
          age: null,
          gender: '',
          pickleballLevel: '',
          tennisLevel: '',
          badmintonLevel: '',
          bio: ''
        }
        
        const { error: profileError } = await profileApi.createUserProfile(data.user.id, profileData)
        if (profileError) throw profileError
        
        userInfo.value = { ...userInfo.value, ...profileData, id: data.user.id }
        isLoggedIn.value = true
        localStorage.setItem('isLoggedIn', 'true')
      }
      
      return { success: true }
    } catch (error) {
      console.error('注册失败:', error)
      errorMessage.value = error || '注册失败，请稍后重试'
      return { success: false, error: errorMessage.value }
    } finally {
      isLoading.value = false
    }
  }

  // 退出登录
  const logout = async () => {
    try {
      isLoading.value = true
      errorMessage.value = ''
      
      const { error } = await authApi.signOut()
      if (error) throw error
      
      userInfo.value = {
        id: null,
        email: '',
        nickname: '新用户',
        avatar: '',
        age: null,
        gender: '',
        pickleballLevel: '',
        tennisLevel: '',
        badmintonLevel: '',
        bio: ''
      }
      isLoggedIn.value = false
      localStorage.removeItem('isLoggedIn')
      
      return { success: true }
    } catch (error) {
      console.error('退出登录失败:', error)
      errorMessage.value = '退出登录失败，请稍后重试'
      return { success: false, error: errorMessage.value }
    } finally {
      isLoading.value = false
    }
  }

  // 更新用户信息
  const updateUserInfo = async (info) => {
    try {
      isLoading.value = true
      errorMessage.value = ''
      
      if (!userInfo.value.id) {
        throw new Error('用户未登录')
      }
      
      // 映射前端字段到数据库字段
      const dbInfo = {
        nickname: info.nickname,
        age: info.age,
        gender: info.gender,
        pickleball_level: info.pickleballLevel,
        tennis_level: info.tennisLevel,
        badminton_level: info.badmintonLevel,
        bio: info.bio
      }
      
      const { error } = await profileApi.updateUserProfile(userInfo.value.id, dbInfo)
      if (error) throw error
      
      userInfo.value = { ...userInfo.value, ...info }
      
      return { success: true }
    } catch (error) {
      console.error('更新用户信息失败:', error)
      errorMessage.value = error || '更新用户信息失败，请稍后重试'
      return { success: false, error: errorMessage.value }
    } finally {
      isLoading.value = false
    }
  }

  // 清除错误信息
  const clearError = () => {
    errorMessage.value = ''
  }

  // 初始化
  initUser()

  return {
    userInfo,
    isLoggedIn,
    isLoading,
    errorMessage,
    login,
    register,
    logout,
    updateUserInfo,
    clearError,
    initUser
  }
})