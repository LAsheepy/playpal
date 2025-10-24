<template>
  <div class="home-container">
    <!-- 搜索和筛选区域 -->
    <div class="filter-section">
      <van-search
        v-model="searchKeyword"
        placeholder="搜索球局"
        shape="round"
        @search="onSearch"
      />
      
      <div class="filter-tabs">
        <van-tabs v-model:active="activeFilter" @change="onFilterChange">
          <van-tab title="全部"></van-tab>
          <van-tab title="匹克球"></van-tab>
          <van-tab title="网球"></van-tab>
          <van-tab title="羽毛球"></van-tab>
        </van-tabs>
      </div>
    </div>

    <!-- 球局列表 -->
    <div class="match-list">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <div
            v-for="match in filteredMatches"
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
            </div>
            
            <div class="match-footer">
              <div class="creator-info">
                <van-image
                  round
                  width="24"
                  height="24"
                  :src="match.creator.avatar || '/default-avatar.jpg'"
                />
                <span>{{ match.creator.nickname }}</span>
              </div>
              <div class="players-count">
                {{ match.currentPlayers }}/{{ match.maxPlayers }}人
              </div>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>
    </div>

    <!-- 创建球局按钮 -->
    <van-floating-bubble
      v-model:offset="offset"
      axis="xy"
      magnetic="x"
      @click="goToCreate"
    >
      <van-icon name="plus" size="24" color="white" />
    </van-floating-bubble>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMatchStore } from '../stores/match'
import { useUserStore } from '../stores/user'
import {
  Search as VanSearch,
  Tabs as VanTabs,
  Tab as VanTab,
  PullRefresh as VanPullRefresh,
  List as VanList,
  Icon as VanIcon,
  Image as VanImage,
  FloatingBubble as VanFloatingBubble
} from 'vant'
import { getSportColor, getLevelColor } from '../utils/colors'

const router = useRouter()
const matchStore = useMatchStore()
const userStore = useUserStore()

// 搜索和筛选
const searchKeyword = ref('')
const activeFilter = ref(0)
const filterOptions = ['', '匹克球', '网球', '羽毛球']

// 列表状态
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

// 悬浮按钮位置
const offset = ref({ x: 300, y: 600 })

// 计算筛选后的球局列表
const filteredMatches = computed(() => {
  let matches = matchStore.getFilteredMatches()
  
  // 应用搜索关键词筛选
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    matches = matches.filter(match => 
      match.title.toLowerCase().includes(keyword) ||
      match.location.toLowerCase().includes(keyword) ||
      match.description.toLowerCase().includes(keyword)
    )
  }
  
  return matches
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
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 搜索
const onSearch = () => {
  refreshing.value = true
  onRefresh()
}

// 筛选变化
const onFilterChange = (index) => {
  const sport = filterOptions[index]
  matchStore.updateFilter({ sport })
}

// 下拉刷新
const onRefresh = () => {
  // 模拟刷新数据
  setTimeout(() => {
    refreshing.value = false
  }, 1000)
}

// 加载更多
const onLoad = () => {
  // 模拟加载更多数据
  setTimeout(() => {
    loading.value = false
    finished.value = true
  }, 500)
}

// 跳转到球局详情
const goToMatchDetail = (matchId) => {
  router.push(`/match/${matchId}`)
}

// 跳转到创建球局
const goToCreate = () => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  router.push('/create')
}

onMounted(() => {
  // 检查登录状态
  if (!userStore.isLoggedIn) {
    router.push('/login')
  }
})
</script>

<style scoped>
.home-container {
  height: 100vh;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
}

.filter-section {
  background: white;
}

.filter-tabs {
  padding: 0 16px;
}

.match-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.match-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s;
}

.match-card:hover {
  transform: translateY(-2px);
}

.match-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.sport-tag {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: bold;
  color: white;
}

/* 移除固定颜色类，使用动态样式 */

.level-tag {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  background-color: #f0f0f0;
  color: #666;
}

.match-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #333;
}

.match-info {
  margin-bottom: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  font-size: 14px;
  color: #666;
}

.info-item .van-icon {
  margin-right: 6px;
  color: #999;
}

.match-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.creator-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.players-count {
  font-size: 14px;
  color: #999;
}
</style>