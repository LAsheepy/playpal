<template>
  <div class="leaderboard-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <van-nav-bar 
        title="排行榜" 
        left-text="返回" 
        left-arrow
        @click-left="goBack"
      />
    </div>
    
    <!-- 当前用户排名信息 -->
    <div v-if="currentUserRank" class="current-user-rank">
      <van-cell 
        :title="`我的排名：第${currentUserRank.rank}名`" 
        :value="`胜率：${currentUserRank.winRate}%`"
        :label="`对战场次：${currentUserRank.totalBattles}场`"
        icon="medal"
      />
    </div>
    
    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-section">
      <van-loading size="24px" vertical>加载中...</van-loading>
    </div>
    
    <!-- 排行榜内容 -->
    <div v-else class="leaderboard-content">
      <!-- 前三名展示区 - 三角形布局 -->
      <div v-if="topThreeUsers.length > 0" class="top-three-section">
        <div class="top-three-title">🏆 顶尖高手</div>
        <div class="triangle-layout">
          <!-- 第二名 -->
          <div class="rank-item rank-2">
            <div class="rank-medal silver">🥈</div>
            <div class="user-avatar">
              <van-image
                round
                width="60"
                height="60"
                :src="topThreeUsers[1].avatar || '/default-avatar.jpg'"
              />
            </div>
            <div class="user-info">
              <div class="user-name">{{ topThreeUsers[1].nickname }}</div>
              <div class="user-stats">
                <span class="win-rate">{{ topThreeUsers[1].winRate }}%</span>
                <span class="total-battles">{{ topThreeUsers[1].totalBattles }}场</span>
              </div>
            </div>
          </div>
          
          <!-- 第一名 -->
          <div class="rank-item rank-1">
            <div class="rank-medal gold">🥇</div>
            <div class="user-avatar">
              <van-image
                round
                width="80"
                height="80"
                :src="topThreeUsers[0].avatar || '/default-avatar.jpg'"
              />
            </div>
            <div class="user-info">
              <div class="user-name">{{ topThreeUsers[0].nickname }}</div>
              <div class="user-stats">
                <span class="win-rate">{{ topThreeUsers[0].winRate }}%</span>
                <span class="total-battles">{{ topThreeUsers[0].totalBattles }}场</span>
              </div>
            </div>
          </div>
          
          <!-- 第三名 -->
          <div class="rank-item rank-3">
            <div class="rank-medal bronze">🥉</div>
            <div class="user-avatar">
              <van-image
                round
                width="60"
                height="60"
                :src="topThreeUsers[2].avatar || '/default-avatar.jpg'"
              />
            </div>
            <div class="user-info">
              <div class="user-name">{{ topThreeUsers[2].nickname }}</div>
              <div class="user-stats">
                <span class="win-rate">{{ topThreeUsers[2].winRate }}%</span>
                <span class="total-battles">{{ topThreeUsers[2].totalBattles }}场</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 其他用户列表 -->
      <div v-if="otherUsers.length > 0" class="other-users-section">
        <div class="section-title">其他玩家</div>
        <van-cell-group>
          <van-cell
            v-for="user in otherUsers"
            :key="user.userId"
            :title="`${user.rank}. ${user.nickname}`"
            :value="`${user.winRate}%`"
            :label="`${user.totalBattles}场对战`"
          >
            <template #icon>
              <div class="rank-number">{{ user.rank }}</div>
            </template>
            <template #right-icon>
              <div class="user-avatar-small">
                <van-image
                  round
                  width="40"
                  height="40"
                  :src="user.avatar || '/default-avatar.jpg'"
                />
              </div>
            </template>
          </van-cell>
        </van-cell-group>
      </div>
      
      <!-- 空状态 -->
      <div v-else-if="topThreeUsers.length === 0" class="empty-state">
        <van-empty image="search" description="暂无排行榜数据">
          <van-button round type="primary" @click="refreshData">
            刷新数据
          </van-button>
        </van-empty>
      </div>
    </div>
    
    <!-- 错误提示 -->
    <div v-if="errorMessage" class="error-section">
      <van-notice-bar 
        :text="errorMessage" 
        background="#fff2f0" 
        color="#ff4d4f"
        left-icon="warning"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLeaderboardStore } from '../stores/leaderboard'
import { useUserStore } from '../stores/user'
import {
  NavBar as VanNavBar,
  Cell as VanCell,
  CellGroup as VanCellGroup,
  Loading as VanLoading,
  Empty as VanEmpty,
  Button as VanButton,
  NoticeBar as VanNoticeBar,
  Image as VanImage,
  showToast
} from 'vant'

const router = useRouter()
const leaderboardStore = useLeaderboardStore()
const userStore = useUserStore()

// 计算属性
const isLoading = computed(() => leaderboardStore.isLoading)
const errorMessage = computed(() => leaderboardStore.errorMessage)
const topThreeUsers = computed(() => leaderboardStore.topThreeUsers)
const otherUsers = computed(() => leaderboardStore.otherUsers)
const currentUserRank = computed(() => leaderboardStore.getCurrentUserRank)

// 页面加载
onMounted(() => {
  console.log('排行榜页面加载')
  // 如果用户未登录，跳转到登录页
  if (!userStore.isLoggedIn) {
    showToast('请先登录查看排行榜')
    router.push('/login')
    return
  }
  
  // 加载排行榜数据
  leaderboardStore.loadLeaderboard()
})

onUnmounted(() => {
  // 清理资源
  leaderboardStore.clearError()
})

// 返回上一页
const goBack = () => {
  router.back()
}

// 刷新数据
const refreshData = () => {
  leaderboardStore.loadLeaderboard()
  showToast('正在刷新数据...')
}
</script>

<style scoped>
.leaderboard-container {
  height: 100vh;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
}

.page-header {
  flex-shrink: 0;
}

.current-user-rank {
  margin: 8px 16px;
  border-radius: 8px;
  overflow: hidden;
}

.loading-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.leaderboard-content {
  flex: 1;
  overflow-y: auto;
}

/* 前三名展示区 */
.top-three-section {
  padding: 20px 16px;
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  border-radius: 0 0 20px 20px;
  margin-bottom: 16px;
}

.top-three-title {
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
}

.triangle-layout {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 10px;
  align-items: end;
}

.rank-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.rank-item:hover {
  transform: translateY(-2px);
}

.rank-1 {
  grid-column: 2;
  grid-row: 1;
  order: 2;
  padding: 20px 12px;
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid #ffd700;
}

.rank-2 {
  grid-column: 1;
  grid-row: 2;
  order: 1;
}

.rank-3 {
  grid-column: 3;
  grid-row: 2;
  order: 3;
}

.rank-medal {
  font-size: 24px;
  margin-bottom: 8px;
}

.gold {
  color: #ffd700;
}

.silver {
  color: #c0c0c0;
}

.bronze {
  color: #cd7f32;
}

.user-avatar {
  margin-bottom: 8px;
}

.user-info {
  text-align: center;
}

.user-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
  word-break: break-all;
}

.user-stats {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.win-rate {
  font-size: 12px;
  color: #52c41a;
  font-weight: bold;
}

.total-battles {
  font-size: 10px;
  color: #666;
}

/* 其他用户区域 */
.other-users-section {
  padding: 0 16px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin: 16px 0 12px;
  padding-left: 8px;
}

.rank-number {
  width: 24px;
  height: 24px;
  background: #1890ff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  margin-right: 12px;
}

.user-avatar-small {
  margin-left: 8px;
}

/* 空状态 */
.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 错误提示 */
.error-section {
  margin: 8px 16px;
  border-radius: 6px;
  overflow: hidden;
}

/* 响应式设计 */
@media (max-width: 320px) {
  .triangle-layout {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(3, auto);
    gap: 12px;
  }
  
  .rank-1, .rank-2, .rank-3 {
    grid-column: 1;
    grid-row: auto;
    order: 0;
  }
  
  .rank-item {
    flex-direction: row;
    align-items: center;
    padding: 12px;
  }
  
  .user-info {
    text-align: left;
    margin-left: 12px;
    flex: 1;
  }
  
  .user-stats {
    flex-direction: row;
    gap: 8px;
  }
}

@media (min-width: 768px) {
  .top-three-section {
    padding: 30px 20px;
  }
  
  .triangle-layout {
    gap: 20px;
  }
  
  .rank-item {
    padding: 20px 16px;
  }
  
  .rank-1 {
    padding: 25px 20px;
  }
  
  .user-name {
    font-size: 16px;
  }
  
  .win-rate, .total-battles {
    font-size: 14px;
  }
}
</style>