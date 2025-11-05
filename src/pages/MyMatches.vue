<template>
  <div class="my-matches-container">
    <!-- 返回按钮 -->
    <van-nav-bar
      title="我的球局"
      left-text="返回"
      left-arrow
      @click-left="goBack"
    />
    
    <!-- 分类标签 -->
    <van-tabs v-model:active="activeTab" @change="onTabChange">
      <van-tab title="全部球局">
        <MatchList 
          :matches="myMatches" 
          :loading="loading"
          :refreshing="refreshing"
          :finished="finished"
          @refresh="onRefresh"
          @load="onLoad"
          @match-click="goToMatchDetail"
        />
      </van-tab>
      <van-tab title="我创建的">
        <MatchList 
          :matches="createdMatches" 
          :loading="loading"
          :refreshing="refreshing"
          :finished="finished"
          @refresh="onRefresh"
          @load="onLoad"
          @match-click="goToMatchDetail"
        />
      </van-tab>
      <van-tab title="我参与的">
        <MatchList 
          :matches="participatedMatches" 
          :loading="loading"
          :refreshing="refreshing"
          :finished="finished"
          @refresh="onRefresh"
          @load="onLoad"
          @match-click="goToMatchDetail"
        />
      </van-tab>
    </van-tabs>
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
  Tabs as VanTabs,
  Tab as VanTab,
  PullRefresh as VanPullRefresh,
  List as VanList,
  Icon as VanIcon,
  Tag as VanTag,
  Empty as VanEmpty
} from 'vant'

// 球局列表组件
const MatchList = {
  props: ['matches', 'loading', 'refreshing', 'finished'],
  emits: ['refresh', 'load', 'match-click'],
  setup(props, { emit }) {
    const userStore = useUserStore()
    
    const getMatchStatus = (match) => {
      const now = new Date()
      const matchTime = new Date(match.time)
      
      if (matchTime > now) {
        return '未开始'
      } else if (matchTime.getTime() + 3 * 60 * 60 * 1000 > now.getTime()) {
        return '进行中'
      } else {
        return '已结束'
      }
    }
    
    const getMatchStatusType = (match) => {
      const status = getMatchStatus(match)
      switch (status) {
        case '未开始': return 'primary'
        case '进行中': return 'success'
        case '已结束': return 'warning'
        default: return 'default'
      }
    }
    
    const formatTime = (time) => {
      return new Date(time).toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    return {
      getSportColor,
      getLevelColor,
      getMatchStatus,
      getMatchStatusType,
      formatTime,
      userStore
    }
  },
  template: `
    <div class="matches-list">
      <van-pull-refresh v-model="refreshing" @refresh="$emit('refresh')">
        <van-empty v-if="matches.length === 0 && !loading" description="暂无球局" />
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="$emit('load')"
        >
          <div
            v-for="match in matches"
            :key="match.id"
            class="match-card"
            @click="$emit('match-click', match.id)"
          >
            <div class="match-header">
              <span class="sport-tag" :style="{ backgroundColor: getSportColor(match.sport) }">
                {{ match.sport }}
              </span>
              <span class="level-tag" :style="{ backgroundColor: getLevelColor(match.creator.level) }">
                {{ match.creator.level }}
              </span>
              <span class="role-tag" :class="{ creator: match.creator.id === userStore.userInfo.id }">
                {{ match.creator.id === userStore.userInfo.id ? '创建者' : '参与者' }}
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
            
            <div class="match-footer">
              <div class="match-status">
                <van-tag :type="getMatchStatusType(match)">
                  {{ getMatchStatus(match) }}
                </van-tag>
              </div>
              <div class="match-creator">
                <span v-if="match.creator.id !== userStore.userInfo.id">
                  创建者: {{ match.creator.nickname }}
                </span>
              </div>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>
    </div>
  `
}

const router = useRouter()
const matchStore = useMatchStore()
const userStore = useUserStore()

const activeTab = ref(0)
const refreshing = ref(false)
const loading = ref(false)
const finished = ref(false)

// 计算属性获取不同分类的球局
const myMatches = computed(() => matchStore.getMyMatches())
const createdMatches = computed(() => matchStore.getCreatedMatches())
const participatedMatches = computed(() => matchStore.getParticipatedMatches())

const goBack = () => {
  router.back()
}

const goToMatchDetail = (matchId) => {
  router.push(`/match/${matchId}`)
}

const onTabChange = (index) => {
  activeTab.value = index
}

const onRefresh = () => {
  refreshing.value = true
  // 重新加载数据
  matchStore.loadMatches().then(() => {
    refreshing.value = false
  })
}

const onLoad = () => {
  setTimeout(() => {
    loading.value = false
    finished.value = true
  }, 1000)
}

onMounted(async () => {
  // 检查登录状态
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  
  try {
    // 确保球局数据已加载
    if (userStore.isGuestMode) {
      await matchStore.browseMatches()
    } else {
      await matchStore.loadMatches()
    }
  } catch (error) {
    console.error('加载球局数据失败:', error)
  }
})
</script>

<style scoped>
.my-matches-container {
  height: 100vh;
  background-color: #f8f9fa;
}

.matches-list {
  padding: 16px;
  height: calc(100vh - 96px);
  overflow-y: auto;
}

.match-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.match-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.match-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  gap: 8px;
}

.sport-tag, .level-tag, .role-tag {
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.role-tag {
  background-color: #666;
}

.role-tag.creator {
  background-color: #1989fa;
}

.match-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
  line-height: 1.4;
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

.match-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.match-status {
  flex-shrink: 0;
}

.match-creator {
  font-size: 12px;
  color: #999;
  text-align: right;
  flex: 1;
}

:deep(.van-tabs__line) {
  background-color: #1989fa;
}

:deep(.van-tab) {
  font-size: 14px;
}

:deep(.van-tab--active) {
  color: #1989fa;
}
</style>