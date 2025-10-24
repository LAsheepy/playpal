<template>
  <div class="history-container">
    <!-- 返回按钮 -->
    <van-nav-bar
      title="历史记录"
      left-text="返回"
      left-arrow
      @click-left="goBack"
    />
    
    <!-- 历史记录列表 -->
    <div class="history-list">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <div
            v-for="record in historyRecords"
            :key="record.id"
            class="history-card"
          >
            <div class="record-header">
              <span class="sport-tag" :style="{ backgroundColor: getSportColor(record.sport) }">
                {{ record.sport }}
              </span>
              <span class="date">{{ formatDate(record.date) }}</span>
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
              
              <div class="participants">
                <span class="label">参与人员：</span>
                <div class="participant-list">
                  <span 
                    v-for="participant in record.participants" 
                    :key="participant.id"
                    class="participant-name"
                  >
                    {{ participant.name }}
                  </span>
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
        </van-list>
      </van-pull-refresh>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getSportColor } from '../utils/colors'
import {
  NavBar as VanNavBar,
  PullRefresh as VanPullRefresh,
  List as VanList,
  Icon as VanIcon,
  Tag as VanTag
} from 'vant'

const router = useRouter()

const refreshing = ref(false)
const loading = ref(false)
const finished = ref(false)

// 模拟历史记录数据
const historyRecords = ref([
  {
    id: 1,
    sport: '匹克球',
    date: '2024-10-20',
    title: '周末匹克球友谊赛',
    location: '朝阳体育馆',
    participants: [
      { id: 1, name: '张三' },
      { id: 2, name: '李四' },
      { id: 3, name: '王五' }
    ],
    result: 'win',
    score: '21-18'
  },
  {
    id: 2,
    sport: '网球',
    date: '2024-10-18',
    title: '网球双打练习',
    location: '海淀网球中心',
    participants: [
      { id: 1, name: '张三' },
      { id: 4, name: '赵六' }
    ],
    result: 'loss',
    score: '4-6, 3-6'
  },
  {
    id: 3,
    sport: '羽毛球',
    date: '2024-10-15',
    title: '羽毛球混双比赛',
    location: '东单体育中心',
    participants: [
      { id: 1, name: '张三' },
      { id: 5, name: '钱七' }
    ],
    result: 'win',
    score: '21-15, 21-17'
  }
])

const goBack = () => {
  router.back()
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

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.history-container {
  height: 100vh;
  background-color: #f8f9fa;
}

.history-list {
  padding: 16px;
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

.date {
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
  margin-bottom: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
}

.participants {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
}

.label {
  color: #666;
  font-size: 14px;
  white-space: nowrap;
}

.participant-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.participant-name {
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  color: #666;
}

.record-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.score {
  color: #666;
  font-size: 14px;
}
</style>