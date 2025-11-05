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
    <!-- 前三名展示区 - 紧凑圆形布局 -->
    <div v-if="topThreeUsers.length > 0" class="top-three-section">
      <div class="top-three-title">🏆 顶尖高手</div>
      <div class="compact-circle-layout">
        <!-- 第二名 -->
        <div class="rank-circle rank-2">
          <div class="circle-content">
            <div class="medal-badge silver">🥈</div>
            <div class="avatar-wrapper">
              <van-image
                round
                width="45"
                height="45"
                :src="topThreeUsers[1].avatar || '/default-avatar.jpg'"
              />
            </div>
            <div class="rank-info">
              <div class="nickname">{{ topThreeUsers[1].nickname }}</div>
              <div class="stats">
                <span class="win-rate">{{ topThreeUsers[1].winRate }}%</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 第一名 -->
        <div class="rank-circle rank-1">
          <div class="circle-content">
            <div class="medal-badge gold">🥇</div>
            <div class="avatar-wrapper">
              <van-image
                round
                width="55"
                height="55"
                :src="topThreeUsers[0].avatar || '/default-avatar.jpg'"
              />
            </div>
            <div class="rank-info">
              <div class="nickname">{{ topThreeUsers[0].nickname }}</div>
              <div class="stats">
                <span class="win-rate">{{ topThreeUsers[0].winRate }}%</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 第三名 -->
        <div class="rank-circle rank-3">
          <div class="circle-content">
            <div class="medal-badge bronze">🥉</div>
            <div class="avatar-wrapper">
              <van-image
                round
                width="45"
                height="45"
                :src="topThreeUsers[2].avatar || '/default-avatar.jpg'"
              />
            </div>
            <div class="rank-info">
              <div class="nickname">{{ topThreeUsers[2].nickname }}</div>
              <div class="stats">
                <span class="win-rate">{{ topThreeUsers[2].winRate }}%</span>
              </div>
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

/* 前三名展示区 - 紧凑圆形布局 */
.top-three-section {
  padding: 16px 12px;
  background: #ffffff;
  border-radius: 12px;
  margin: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.top-three-title {
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.compact-circle-layout {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 8px;
}

.rank-circle {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.circle-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.medal-badge {
  font-size: 20px;
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

.avatar-wrapper {
  margin-bottom: 8px;
}

.rank-info {
  text-align: center;
  width: 100%;
}

.nickname {
  font-size: 12px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  word-break: break-all;
  line-height: 1.2;
}

.stats {
  display: flex;
  justify-content: center;
}

.win-rate {
  font-size: 11px;
  color: #52c41a;
  font-weight: bold;
  padding: 2px 6px;
  background: #f6ffed;
  border-radius: 10px;
}

/* 第一名特殊样式 */
.rank-1 {
  order: 2;
}

.rank-1 .circle-content {
  transform: scale(1.1);
}

.rank-1 .medal-badge {
  font-size: 22px;
}

.rank-1 .nickname {
  font-size: 13px;
}

/* 第二名和第三名 */
.rank-2 {
  order: 1;
}

.rank-3 {
  order: 3;
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
  .compact-circle-layout {
    flex-direction: column;
    gap: 12px;
  }
  
  .rank-circle {
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
  }
  
  .circle-content {
    flex-direction: row;
    align-items: center;
    width: 100%;
  }
  
  .medal-badge {
    margin-right: 8px;
    margin-bottom: 0;
  }
  
  .avatar-wrapper {
    margin-right: 8px;
    margin-bottom: 0;
  }
  
  .rank-info {
    text-align: left;
    flex: 1;
  }
  
  .rank-1 .circle-content {
    transform: none;
  }
}

@media (min-width: 768px) {
  .top-three-section {
    padding: 20px 16px;
    margin: 20px;
  }
  
  .compact-circle-layout {
    gap: 12px;
  }
  
  .rank-1 .avatar-wrapper :deep(.van-image) {
    width: 65px !important;
    height: 65px !important;
  }
  
  .rank-2 .avatar-wrapper :deep(.van-image),
  .rank-3 .avatar-wrapper :deep(.van-image) {
    width: 50px !important;
    height: 50px !important;
  }
  
  .nickname {
    font-size: 14px;
  }
  
  .rank-1 .nickname {
    font-size: 15px;
  }
  
  .win-rate {
    font-size: 12px;
  }
}
</style>