<template>
  <div class="my-matches-container">
    <!-- 返回按钮 -->
    <van-nav-bar
      title="我的球局"
      left-text="返回"
      left-arrow
      @click-left="goBack"
    />
    
    <!-- 球局列表 -->
    <div class="matches-list">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <div
            v-for="match in myMatches"
            :key="match.id"
            class="match-card"
            @click="goToMatchDetail(match.id)"
          >
            <div class="match-header">
              <span class="sport-tag" :style="{ backgroundColor: getSportColor(match.sport) }">
                {{ match.sport }}
              </span>
              <span class="level-tag" :style="{ backgroundColor: getLevelColor(match.creator.level) }">
                {{ match.creator.level }}
              </span>
            </div>
            
            <div class="match-title">{{ match.title }}</div>
            
            <div class="match-info">
              <div class="info-item">
                <van-icon name="clock-o" />
                <span>{{ formatTime(match.time) }}</span>
              </div>
              <div class="info-item">
                <van-icon name="location-o" />
                <span>{{ match.location }}</span>
              </div>
              <div class="info-item">
                <van-icon name="friends-o" />
                <span>{{ match.currentPlayers }}/{{ match.maxPlayers }}人</span>
              </div>
            </div>
            
            <div class="match-status">
              <van-tag :type="getStatusType(match.status)">
                {{ getStatusText(match.status) }}
              </van-tag>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMatchStore } from '../stores/match'
import { useUserStore } from '../stores/user'
import { getSportColor, getLevelColor } from '../utils/colors'
import {
  NavBar as VanNavBar,
  PullRefresh as VanPullRefresh,
  List as VanList,
  Icon as VanIcon,
  Tag as VanTag
} from 'vant'

const router = useRouter()
const matchStore = useMatchStore()
const userStore = useUserStore()

const refreshing = ref(false)
const loading = ref(false)
const finished = ref(false)

const myMatches = computed(() => {
  return matchStore.matches.filter(match => 
    match.creator.id === userStore.userInfo.id
  )
})

const goBack = () => {
  router.back()
}

const goToMatchDetail = (matchId) => {
  router.push(`/match/${matchId}`)
}

const onRefresh = () => {
  refreshing.value = true
  setTimeout(() => {
    refreshing.value = false
  }, 1000)
}

const onLoad = () => {
  setTimeout(() => {
    loading.value = false
    finished.value = true
  }, 1000)
}

const formatTime = (time) => {
  return new Date(time).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusType = (status) => {
  const types = {
    '进行中': 'primary',
    '已结束': 'danger',
    '已取消': 'default'
  }
  return types[status] || 'default'
}

const getStatusText = (status) => {
  const texts = {
    'active': '进行中',
    'ended': '已结束',
    'cancelled': '已取消'
  }
  return texts[status] || status
}
</script>

<style scoped>
.my-matches-container {
  height: 100vh;
  background-color: #f8f9fa;
}

.matches-list {
  padding: 16px;
}

.match-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.match-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.sport-tag, .level-tag {
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.match-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
}

.match-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
}

.match-status {
  text-align: right;
}
</style>