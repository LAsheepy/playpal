<template>
  <div class="match-detail-container">
    <van-nav-bar
      title="球局详情"
      left-text="返回"
      left-arrow
      @click-left="goBack"
    />

    <div class="content" v-if="matchDetail">
      <!-- 球局基本信息 -->
      <div class="match-basic-info">
        <div class="sport-tag" :style="{ backgroundColor: getSportColor(matchDetail.sport) }">
          {{ matchDetail.sport }}
        </div>
        <h2 class="match-title">{{ matchDetail.title }}</h2>
        <div class="creator-info">
          <van-image
            round
            width="32"
            height="32"
            :src="matchDetail.creator.avatar || '/default-avatar.jpg'"
          />
          <div class="creator-details">
            <span class="creator-name">{{ matchDetail.creator.nickname }}</span>
            <span class="creator-level" :style="{ 
              backgroundColor: getLevelColor(matchDetail.creator.level),
              color: getLevelTextColor(matchDetail.creator.level)
            }">
              {{ matchDetail.creator.level }}
            </span>
          </div>
        </div>
      </div>

      <!-- 详细信息卡片 -->
      <div class="info-card">
        <div class="info-item">
          <van-icon name="clock-o" />
          <div class="info-content">
            <div class="info-label">时间</div>
            <div class="info-value">{{ formatTime(matchDetail.time) }}</div>
          </div>
        </div>
        
        <div class="info-item">
          <van-icon name="location-o" />
          <div class="info-content">
            <div class="info-label">地点</div>
            <div class="info-value">{{ matchDetail.location }}</div>
          </div>
        </div>
        
        <div class="info-item">
          <van-icon name="friends-o" />
          <div class="info-content">
            <div class="info-label">人数</div>
            <div class="info-value">
              {{ matchDetail.currentPlayers }}/{{ matchDetail.maxPlayers }}人
              <van-progress 
                :percentage="(matchDetail.currentPlayers / matchDetail.maxPlayers) * 100"
                stroke-width="4"
                color="#1989fa"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 球局描述 -->
      <div class="description-card" v-if="matchDetail.description">
        <h3>球局说明</h3>
        <p>{{ matchDetail.description }}</p>
      </div>

      <!-- 参与成员 -->
      <div class="participants-card">
        <div class="card-header">
          <h3>参与成员 ({{ matchDetail.participants.length }})</h3>
        </div>
        <div class="participants-list">
          <div 
            v-for="participant in matchDetail.participants" 
            :key="participant.id"
            class="participant-item"
            @click="viewParticipantProfile(participant)"
          >
            <van-image
              round
              width="40"
              height="40"
              :src="participant.avatar || '/default-avatar.jpg'"
            />
            <div class="participant-info">
              <span class="participant-name">{{ participant.nickname }}</span>
              <span class="participant-level" :style="{ 
                backgroundColor: getLevelColor(participant.level),
                color: getLevelTextColor(participant.level)
              }">
                {{ participant.level }}
              </span>
            </div>
            <van-tag 
              v-if="participant.id === matchDetail.creator.id" 
              type="primary" 
              size="small"
            >
              发起人
            </van-tag>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <van-button 
          v-if="!isJoined"
          type="primary" 
          size="large" 
          block
          :disabled="isFull"
          @click="handleJoin"
        >
          {{ isFull ? '已满员' : '加入球局' }}
        </van-button>
        
        <van-button 
          v-else
          type="default" 
          size="large" 
          block
          @click="handleLeave"
        >
          退出球局
        </van-button>
      </div>
    </div>

    <div class="loading" v-else>
      <van-loading type="spinner" size="24px">加载中...</van-loading>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMatchStore } from '../stores/match'
import { useUserStore } from '../stores/user'
import {
  showToast,
  showConfirmDialog,
  NavBar as VanNavBar,
  Image as VanImage,
  Icon as VanIcon,
  Button as VanButton,
  Cell as VanCell,
  CellGroup as VanCellGroup,
  Progress as VanProgress,
  Tag as VanTag
} from 'vant'
import { getSportColor, getLevelColor, getLevelTextColor } from '../utils/colors'

const route = useRoute()
const router = useRouter()
const matchStore = useMatchStore()
const userStore = useUserStore()

const matchDetail = ref(null)

// 计算属性
const isJoined = computed(() => {
  if (!matchDetail.value || !userStore.isLoggedIn) return false
  return matchDetail.value.participants.some(
    p => p.id === userStore.userInfo.id
  )
})

const isFull = computed(() => {
  if (!matchDetail.value) return false
  return matchDetail.value.currentPlayers >= matchDetail.value.maxPlayers
})

// 运动类型样式
const getSportClass = (sport) => {
  const sportClasses = {
    '匹克球': 'pickleball',
    '网球': 'tennis',
    '羽毛球': 'badminton'
  }
  return sportClasses[sport] || ''
}

// 格式化时间
const formatTime = (timeStr) => {
  const date = new Date(timeStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short'
  })
}

// 加入球局
const handleJoin = async () => {
  if (!userStore.isLoggedIn) {
    showToast({
      message: '请先登录',
      className: 'custom-toast'
    })
    router.push('/login')
    return
  }

  const success = matchStore.joinMatch(matchDetail.value.id, {
    id: userStore.userInfo.id,
    nickname: userStore.userInfo.nickname,
    level: userStore.userInfo.level,
    avatar: userStore.userInfo.avatar
  })

  if (success) {
    showToast({
      message: '加入成功',
      className: 'custom-toast'
    })
    // 刷新详情数据
    matchDetail.value = matchStore.getMatchDetail(matchDetail.value.id)
  } else {
    showToast({
      message: '加入失败，请重试',
      className: 'custom-toast'
    })
  }
}

// 退出球局
const handleLeave = async () => {
  showConfirmDialog({
    title: '确认退出',
    message: '确定要退出这个球局吗？',
    className: 'custom-dialog'
  }).then(() => {
    const success = matchStore.leaveMatch(matchDetail.value.id, userStore.userInfo.id)
    
    if (success) {
      showToast({
        message: '退出成功',
        className: 'custom-toast'
      })
      // 刷新详情数据
      matchDetail.value = matchStore.getMatchDetail(matchDetail.value.id)
    } else {
      showToast({
        message: '退出失败，请重试',
        className: 'custom-toast'
      })
    }
  })
}

// 查看参与人资料
const viewParticipantProfile = (participant) => {
  // 跳转到用户资料页面，传递用户ID
  // 检查参与人ID是否为有效的UUID格式，如果不是则显示提示
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  
  if (uuidRegex.test(participant.id)) {
    router.push(`/user/${participant.id}`)
  } else {
    showToast({
      message: '该用户资料暂不可用',
      className: 'custom-toast'
    })
  }
}

// 返回
const goBack = () => {
  router.back()
}

onMounted(async () => {
  try {
    const matchId = route.params.id
    console.log('开始获取球局详情，ID:', matchId)
    
    const result = await matchStore.getMatchDetail(matchId)
    
    if (result.success) {
      matchDetail.value = result.data
      console.log('球局详情加载成功:', matchDetail.value)
    } else {
      console.error('获取球局详情失败:', result.error)
      showToast({
      message: '球局不存在或加载失败',
      className: 'custom-toast'
    })
      router.back()
    }
  } catch (error) {
    console.error('球局详情页面加载异常:', error)
    showToast({
      message: '加载失败，请重试',
      className: 'custom-toast'
    })
    router.back()
  }
})
</script>

<style scoped>
.match-detail-container {
  height: 100vh;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.match-basic-info {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  text-align: center;
}

.sport-tag {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
  color: white;
  margin-bottom: 12px;
}

.sport-tag.pickleball {
  background-color: #ff6b6b;
}

.sport-tag.tennis {
  background-color: #4ecdc4;
}

.sport-tag.badminton {
  background-color: #45b7d1;
}

.match-title {
  font-size: 20px;
  font-weight: bold;
  margin: 12px 0;
  color: #333;
}

.creator-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.creator-details {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.creator-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.creator-level {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  min-width: 40px;
  text-align: center;
  font-weight: bold;
}

.info-card,
.description-card,
.participants-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item .van-icon {
  font-size: 20px;
  color: #1989fa;
  margin-right: 12px;
}

.info-content {
  flex: 1;
}

.info-label {
  font-size: 14px;
  color: #999;
  margin-bottom: 4px;
}

.info-value {
  font-size: 16px;
  color: #333;
}

.description-card h3,
.participants-card h3 {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 12px;
  color: #333;
}

.description-card p {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.participants-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.participant-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.participant-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.participant-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.participant-level {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  min-width: 40px;
  text-align: center;
  font-weight: bold;
}

.action-buttons {
  padding: 16px;
  background: white;
}

.loading {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}
/* 自定义弹窗样式 */
:deep(.custom-toast) {
  color: #333 !important;
  background-color: white !important;
}

:deep(.van-toast) {
  color: #333 !important;
  background-color: white !important;
}

:deep(.van-dialog) {
  color: #333 !important;
  background-color: white !important;
}

:deep(.van-popup) {
  color: #333 !important;
  background-color: white !important;
}

</style>