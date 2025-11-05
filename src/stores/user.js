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
  
  // 游客模式
  const isGuestMode = ref(false)
  
  // 加载状态
  const isLoading = ref(false)
  
  // 错误信息
  const errorMessage = ref('')

  // 初始化用户状态
  const initUser = async () => {
    try {
      isLoading.value = true
      errorMessage.value = ''
      
      console.log('开始初始化用户状态...')
      
      // 检查是否为游客模式
      const isGuestModeStored = localStorage.getItem('isGuestMode') === 'true'
      if (isGuestModeStored) {
        console.log('检测到游客模式，初始化游客用户')
        isGuestMode.value = true
        isLoggedIn.value = true
        // 恢复游客用户信息
        userInfo.value = {
          id: 'guest_' + Date.now(),
          email: 'guest@playpal.com',
          nickname: '体验用户' + Math.floor(Math.random() * 1000),
          avatar: '',
          age: 25,
          gender: '未知',
          pickleballLevel: '初级',
          tennisLevel: '初级',
          badmintonLevel: '初级',
          bio: '我是体验用户，正在测试系统功能'
        }
        console.log('游客用户初始化完成:', userInfo.value)
        return
      }
      
      console.log('检查真实用户登录状态...')
      const user = await authApi.getCurrentUser()
      
      if (user) {
        console.log('检测到已登录用户:', user.id)
        const { data: profile, error } = await profileApi.getUserProfile(user.id)
        
        if (error) {
          console.error('获取用户资料失败:', error)
          // 如果用户存在但资料不存在，创建默认资料
          if (error.message.includes('not found')) {
            console.log('用户资料不存在，创建默认资料...')
            await createDefaultProfile(user)
          }
        } else if (profile) {
          console.log('成功获取用户资料:', profile)
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
          console.log('用户状态初始化完成:', userInfo.value)
        }
      } else {
        console.log('用户未登录，清除登录状态')
        isLoggedIn.value = false
        localStorage.removeItem('isLoggedIn')
      }
    } catch (error) {
      console.error('初始化用户失败:', error)
      errorMessage.value = '初始化用户信息失败'
    } finally {
      isLoading.value = false
      console.log('用户初始化过程结束，登录状态:', isLoggedIn.value, '用户ID:', userInfo.value.id)
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

  // 游客登录
  const guestLogin = async () => {
    try {
      isLoading.value = true
      errorMessage.value = ''
      
      // 创建游客用户信息
      const guestId = 'guest_' + Date.now()
      userInfo.value = {
        id: guestId,
        email: 'guest@playpal.com',
        nickname: '体验用户' + Math.floor(Math.random() * 1000),
        avatar: '',
        age: 25,
        gender: '未知',
        pickleballLevel: '初级',
        tennisLevel: '初级',
        badmintonLevel: '初级',
        bio: '我是体验用户，正在测试系统功能'
      }
      
      isLoggedIn.value = true
      isGuestMode.value = true
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('isGuestMode', 'true')
      
      return { success: true }
    } catch (error) {
      console.error('游客登录失败:', error)
      errorMessage.value = '游客登录失败，请稍后重试'
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
      
      // 如果是游客模式，不需要调用后端登出
      if (!isGuestMode.value) {
        const { error } = await authApi.signOut()
        if (error) throw error
      }
      
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
      isGuestMode.value = false
      localStorage.removeItem('isLoggedIn')
      localStorage.removeItem('isGuestMode')
      
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
      
      // 验证用户登录状态
      if (!userInfo.value.id) {
        errorMessage.value = '用户未登录'
        throw new Error(errorMessage.value)
      }
      
      // 验证必填字段
      if (!info.nickname || info.nickname.trim().length === 0) {
        errorMessage.value = '昵称不能为空'
        throw new Error(errorMessage.value)
      }
      
      // 验证昵称长度
      if (info.nickname.length < 2 || info.nickname.length > 20) {
        errorMessage.value = '昵称长度应在2-20个字符之间'
        throw new Error(errorMessage.value)
      }
      
      // 验证昵称格式
      const nicknameRegex = /^[\u4e00-\u9fa5a-zA-Z0-9_]+$/
      if (!nicknameRegex.test(info.nickname)) {
        errorMessage.value = '昵称只能包含中文、英文、数字和下划线'
        throw new Error(errorMessage.value)
      }
      
      // 验证年龄
      if (info.age) {
        const age = parseInt(info.age)
        if (isNaN(age) || age < 1 || age > 100) {
          errorMessage.value = '年龄必须在1-100之间'
          throw new Error(errorMessage.value)
        }
      }
      
      // 验证性别
      if (info.gender && !['男', '女'].includes(info.gender)) {
        errorMessage.value = '请选择有效的性别'
        throw new Error(errorMessage.value)
      }
      
      // 验证运动水平
      const validLevels = {
        pickleball: ['2.0', '2.5', '3.0', '3.5', '4.0', '4.5', '5.0+'],
        tennis: ['2.0', '2.5', '3.0', '3.5', '4.0', '4.5', '5.0+'],
        badminton: ['初级', '进阶', '专业']
      }
      
      if (info.pickleballLevel && !validLevels.pickleball.includes(info.pickleballLevel)) {
        errorMessage.value = '请选择有效的匹克球水平'
        throw new Error(errorMessage.value)
      }
      
      if (info.tennisLevel && !validLevels.tennis.includes(info.tennisLevel)) {
        errorMessage.value = '请选择有效的网球水平'
        throw new Error(errorMessage.value)
      }
      
      if (info.badmintonLevel && !validLevels.badminton.includes(info.badmintonLevel)) {
        errorMessage.value = '请选择有效的羽毛球水平'
        throw new Error(errorMessage.value)
      }
      
      // 验证个人简介长度
      if (info.bio && info.bio.length > 100) {
        errorMessage.value = '个人简介长度不能超过100个字符'
        throw new Error(errorMessage.value)
      }
      
      // 映射前端字段到数据库字段
      const dbInfo = {
        nickname: info.nickname.trim(),
        age: info.age ? parseInt(info.age) : null,
        gender: info.gender || null,
        pickleball_level: info.pickleballLevel || null,
        tennis_level: info.tennisLevel || null,
        badminton_level: info.badmintonLevel || null,
        bio: info.bio ? info.bio.trim() : null
      }
      
      const { error } = await profileApi.updateUserProfile(userInfo.value.id, dbInfo)
      if (error) {
        console.error('更新用户资料API错误:', error)
        
        // 根据错误类型提供更友好的提示
        if (error.message.includes('row-level security')) {
          errorMessage.value = '没有权限更新资料，请检查登录状态'
        } else if (error.message.includes('network') || error.message.includes('Network')) {
          errorMessage.value = '网络连接失败，请检查网络设置'
        } else if (error.message.includes('profiles')) {
          errorMessage.value = '用户资料不存在，请重新登录'
        } else {
          errorMessage.value = '更新资料失败，请稍后重试'
        }
        
        throw error
      }
      
      // 更新本地用户信息
      userInfo.value = { 
        ...userInfo.value, 
        nickname: dbInfo.nickname,
        age: dbInfo.age,
        gender: dbInfo.gender,
        pickleballLevel: dbInfo.pickleball_level,
        tennisLevel: dbInfo.tennis_level,
        badmintonLevel: dbInfo.badminton_level,
        bio: dbInfo.bio
      }
      
      return { success: true }
    } catch (error) {
      console.error('更新用户信息失败:', error)
      return { 
        success: false, 
        error: errorMessage.value || error.message || '更新用户信息失败，请稍后重试' 
      }
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
    isGuestMode,
    isLoading,
    errorMessage,
    login,
    register,
    guestLogin,
    logout,
    updateUserInfo,
    clearError,
    initUser
  }
})