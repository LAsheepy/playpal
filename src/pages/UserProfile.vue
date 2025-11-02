<template>
  <div class="user-profile-container">
    <van-nav-bar
      title="用户资料"
      left-text="返回"
      left-arrow
      @click-left="goBack"
    />

    <div class="content" v-if="userInfo">
      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-container">
        <van-loading size="24px" vertical>加载中...</van-loading>
      </div>
      
      <!-- 用户基本信息 -->
      <div class="user-basic-info">
        <van-image
          round
          width="80"
          height="80"
          :src="userInfo.avatar || '/default-avatar.jpg'"
        />
        <div class="user-details">
          <h2 class="user-name">{{ userInfo.nickname }}</h2>
          <p class="user-bio">{{ userInfo.bio || '这个人很懒，什么都没写' }}</p>
        </div>
      </div>

      <!-- 运动水平 -->
      <div class="sports-level-card">
        <div class="card-header">
          <h3>运动水平</h3>
        </div>
        <div class="sports-level-list">
          <div 
            v-for="sport in userInfo.sports" 
            :key="sport.name"
            class="sport-level-item"
          >
            <span class="sport-name" :style="{ color: getSportColor(sport.name) }">
              {{ sport.name }}
            </span>
            <span class="sport-level" :style="{ backgroundColor: getLevelColor(sport.level) }">
              {{ sport.level }}
            </span>
          </div>
        </div>
      </div>

      <!-- 参与过的球局 -->
      <div class="match-history-card">
        <div class="card-header">
          <h3>参与过的球局</h3>
        </div>
        <div class="match-history-list">
          <div 
            v-for="match in userMatches" 
            :key="match.id"
            class="match-history-item"
            @click="viewMatchDetail(match.id)"
          >
            <div class="match-info">
              <span class="sport-tag" :style="{ backgroundColor: getSportColor(match.sport) }">
                {{ match.sport }}
              </span>
              <span class="match-title">{{ match.title }}</span>
            </div>
            <div class="match-time">{{ formatTime(match.time) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMatchStore } from '../stores/match'
import { useUserStore } from '../stores/user'
import { profileApi } from '../utils/supabase'
import { getSportColor, getLevelColor } from '../utils/colors'
import { 
  NavBar as VanNavBar,
  Image as VanImage,
  Loading as VanLoading
} from 'vant'

const route = useRoute()
const router = useRouter()
const matchStore = useMatchStore()
const userStore = useUserStore()

const userInfo = ref(null)
const userMatches = ref([])
const isLoading = ref(false)

// 获取用户信息
const loadUserInfo = async (userId) => {
  try {
    isLoading.value = true
    
    // 如果是当前用户，使用store中的数据
    if (userId === userStore.userInfo.id) {
      userInfo.value = {
        id: userStore.userInfo.id,
        nickname: userStore.userInfo.nickname,
        avatar: userStore.userInfo.avatar,
        bio: userStore.userInfo.bio,
        sports: [
          { name: '匹克球', level: userStore.userInfo.pickleballLevel || '未设置' },
          { name: '网球', level: userStore.userInfo.tennisLevel || '未设置' },
          { name: '羽毛球', level: userStore.userInfo.badmintonLevel || '未设置' }
        ]
      }
    } else {
      // 如果是其他用户，从API获取数据
      // 首先检查userId是否为有效的UUID格式，如果不是则使用默认数据
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      
      if (uuidRegex.test(userId)) {
        const { data: profile, error } = await profileApi.getUserProfile(userId)
        if (error) throw error
        
        if (profile) {
          userInfo.value = {
            id: profile.id,
            nickname: profile.nickname,
            avatar: profile.avatar,
            bio: profile.bio,
            sports: [
              { name: '匹克球', level: profile.pickleball_level || '未设置' },
              { name: '网球', level: profile.tennis_level || '未设置' },
              { name: '羽毛球', level: profile.badminton_level || '未设置' }
            ]
          }
        }
      } else {
        // 如果userId不是UUID格式，使用默认数据
        throw new Error('用户ID格式无效')
      }
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    // 如果获取失败，显示默认数据
    userInfo.value = {
      id: userId,
      nickname: '球友' + userId,
      avatar: '',
      bio: '热爱运动的球友',
      sports: [
        { name: '匹克球', level: '未设置' },
        { name: '网球', level: '未设置' },
        { name: '羽毛球', level: '未设置' }
      ]
    }
  } finally {
    isLoading.value = false
  }
}

// 获取用户参与的球局
const loadUserMatches = async (userId) => {
  try {
    // 检查登录状态
    if (!userStore.isLoggedIn) {
      console.log('用户未登录，跳过加载用户球局')
      userMatches.value = []
      return
    }
    
    // 先确保球局列表已加载
    await matchStore.loadMatches()
    const allMatches = matchStore.matchList
    
    userMatches.value = allMatches.filter(match => 
      match.participants.some(p => p.id === userId)
    )
  } catch (error) {
    console.error('获取用户球局失败:', error)
    userMatches.value = []
  }
}

// 格式化时间
const formatTime = (timeStr) => {
  return new Date(timeStr).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 查看球局详情
const viewMatchDetail = (matchId) => {
  router.push(`/match/${matchId}`)
}

// 返回
const goBack = () => {
  router.back()
}

onMounted(() => {
  const userId = route.params.id
  loadUserInfo(userId)
  loadUserMatches(userId)
})
</script>

<style scoped>
.user-profile-container {
  height: 100vh;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.user-basic-info {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.user-bio {
  font-size: 14px;
  color: #666;
  line-height: 1.4;
}

.sports-level-card,
.match-history-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-header h3 {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
}

.sports-level-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sport-level-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.sport-level-item:last-child {
  border-bottom: none;
}

.sport-name {
  font-size: 16px;
  font-weight: 500;
}

.sport-level {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: white;
  font-weight: bold;
}

.match-history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.match-history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.match-history-item:hover {
  background: #e9ecef;
}

.match-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sport-tag {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  color: white;
  font-weight: bold;
}

.match-title {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.match-time {
  font-size: 12px;
  color: #666;
}
</style>