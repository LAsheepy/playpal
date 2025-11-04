<template>
  <div class="history-container">
    <!-- 返回按钮 -->
    <van-nav-bar
      title="历史记录"
      left-text="返回"
      left-arrow
      @click-left="goBack"
    />
    
    <!-- 统计信息 -->
    <div v-if="historyStore.stats.total > 0" class="stats-section">
      <div class="stats-card">
        <div class="stat-item">
          <div class="stat-value">{{ historyStore.stats.total }}</div>
          <div class="stat-label">总场次</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ historyStore.stats.wins }}</div>
          <div class="stat-label">胜利</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ historyStore.stats.winRate }}%</div>
          <div class="stat-label">胜率</div>
        </div>
      </div>
    </div>
    
    <!-- 历史记录列表 -->
    <div class="history-list">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <!-- 加载状态 -->
        <div v-if="historyStore.isLoading" class="loading-container">
          <van-loading size="24px" vertical>加载中...</van-loading>
        </div>
        
        <!-- 空状态 -->
        <div v-else-if="historyStore.historyRecords.length === 0" class="empty-state">
          <van-empty image="search" description="暂无历史记录">
            <van-button round type="primary" @click="onRefresh">
              刷新数据
            </van-button>
          </van-empty>
        </div>
        
        <!-- 历史记录内容 -->
        <div v-else>
          <!-- 按日期分组显示 -->
          <div v-for="(records, date) in historyStore.groupedHistoryRecords" :key="date" class="date-group">
            <div class="date-header">{{ date }}</div>
            
            <div
              v-for="record in records"
              :key="record.id"
              class="history-card"
            >
              <div class="record-header">
                <span class="sport-tag" :style="{ backgroundColor: getSportColor(record.sport) }">
                  {{ record.sport }}
                </span>
                <span class="time">{{ formatTime(record.date) }}</span>
              </div>
              
              <div class="record-content">
                <div class="record-title">{{ record.title }}</div>
                
                <div class="record-info">
                  <div class="info-item">
                    <van-icon name="location-o" />
                    <span>{{ record.location }}</span>
                  </div>
                  <div class="info-item">
                    <van-icon name="friends-o" />
                    <span>{{ record.participants.length }}人参与</span>
                  </div>
                </div>
                
                <!-- 队伍信息 -->
                <div class="teams-section">
                  <div class="team-info">
                    <div class="team-label">A队</div>
                    <div class="team-members">
                      <span 
                        v-for="participant in record.teamA" 
                        :key="participant.id"
                        class="participant-name"
                      >
                        {{ participant.name }}
                      </span>
                    </div>
                  </div>
                  
                  <div class="vs-divider">VS</div>
                  
                  <div class="team-info">
                    <div class="team-label">B队</div>
                    <div class="team-members">
                      <span 
                        v-for="participant in record.teamB" 
                        :key="participant.id"
                        class="participant-name"
                      >
                        {{ participant.name }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="record-footer">
                <van-tag :type="record.result === 'win' ? 'success' : 'danger'">
                  {{ record.result === 'win' ? '胜利' : '失败' }}
                </van-tag>
                <span class="score">{{ record.score }}</span>
              </div>
            </div>
          </div>
        </div>
      </van-pull-refresh>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useHistoryStore } from '../stores/history'
import { getSportColor } from '../utils/colors'
import {
  NavBar as VanNavBar,
  PullRefresh as VanPullRefresh,
  Loading as VanLoading,
  Icon as VanIcon,
  Tag as VanTag,
  Empty as VanEmpty,
  Button as VanButton
} from 'vant'

const router = useRouter()
const historyStore = useHistoryStore()

const refreshing = ref(false)

const goBack = () => {
  router.back()
}

const onRefresh = async () => {
  refreshing.value = true
  
  try {
    await historyStore.loadHistoryRecords()
  } catch (error) {
    console.error('刷新历史记录失败:', error)
  } finally {
    refreshing.value = false
  }
}

const formatTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(() => {
  // 页面加载时初始化历史记录
  historyStore.loadHistoryRecords()
})
</script>

<style scoped>
.history-container {
  min-height: 100vh;
  background-color: #f8f9fa;
}

/* 统计信息样式 */
.stats-section {
  padding: 16px;
}

.stats-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  justify-content: space-around;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #666;
}

.history-list {
  padding: 0 16px 16px;
}

/* 日期分组样式 */
.date-group {
  margin-bottom: 20px;
}

.date-header {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  padding-left: 8px;
  border-left: 4px solid #1989fa;
}

.history-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.sport-tag {
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.time {
  color: #999;
  font-size: 14px;
}

.record-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
}

.record-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
}

/* 队伍信息样式 */
.teams-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.team-info {
  flex: 1;
}

.team-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
  text-align: center;
}

.team-members {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
}

.participant-name {
  background: #e8f4fd;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  color: #1989fa;
}

.vs-divider {
  font-size: 14px;
  font-weight: 600;
  color: #999;
  margin: 0 16px;
}

.record-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.score {
  color: #666;
  font-size: 14px;
  font-weight: 600;
}

/* 加载和空状态样式 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
}

.empty-state {
  padding: 40px 0;
}
</style>