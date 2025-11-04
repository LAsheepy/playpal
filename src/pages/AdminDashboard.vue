<template>
  <div class="admin-dashboard">
    <!-- 侧边栏 -->
    <div class="sidebar">
      <div class="sidebar-header">
        <h2>管理员面板</h2>
        <p>数据总览</p>
      </div>
      
      <nav class="sidebar-nav">
        <div 
          v-for="nav in navItems" 
          :key="nav.id"
          class="nav-item"
          :class="{ active: activeNav === nav.id }"
          @click="switchNav(nav.id)"
        >
          <van-icon :name="nav.icon" class="nav-icon" />
          <span class="nav-text">{{ nav.text }}</span>
        </div>
      </nav>
      
      <div class="sidebar-footer">
        <van-button 
          round 
          block 
          type="default" 
          @click="handleLogout"
          class="logout-btn"
        >
          <van-icon name="revoke" />
          退出登录
        </van-button>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 顶部导航栏 -->
      <div class="top-nav">
        <div class="nav-left">
          <h1>{{ getNavTitle(activeNav) }}</h1>
        </div>
        <div class="nav-right">
          <van-button 
            type="primary" 
            size="small" 
            @click="refreshData"
            :loading="isLoading"
          >
            <van-icon name="replay" />
            刷新数据
          </van-button>
          <van-button 
            type="default" 
            size="small" 
            @click="goBack"
          >
            <van-icon name="arrow-left" />
            返回首页
          </van-button>
        </div>
      </div>

      <!-- 数据概览卡片 -->
      <div v-if="activeNav === 'overview'" class="overview-section">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon user-icon">
              <van-icon name="friends-o" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ userStats.totalUsers }}</div>
              <div class="stat-label">总用户数</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon new-user-icon">
              <van-icon name="add-o" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ userStats.todayUsers }}</div>
              <div class="stat-label">今日新增用户</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon active-icon">
              <van-icon name="fire-o" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ userStats.activeUsers }}</div>
              <div class="stat-label">活跃用户</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon match-icon">
              <van-icon name="flag-o" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ matchStats.totalMatches }}</div>
              <div class="stat-label">总球局数</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon new-match-icon">
              <van-icon name="plus" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ matchStats.todayMatches }}</div>
              <div class="stat-label">今日新增球局</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon sport-icon">
              <van-icon name="cluster-o" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ Object.keys(matchStats.sportDistribution || {}).length }}</div>
              <div class="stat-label">运动类型</div>
            </div>
          </div>
        </div>

        <!-- 用户水平分布 -->
        <div class="chart-section">
          <h3>用户水平分布统计</h3>
          <div class="level-charts">
            <div class="chart-container">
              <h4>匹克球水平分布</h4>
              <div class="level-bars">
                <div 
                  v-for="(count, level) in levelStats.pickleball" 
                  :key="`pb-${level}`"
                  class="level-bar"
                >
                  <div class="level-label">{{ level }}</div>
                  <div class="bar-container">
                    <div 
                      class="bar-fill"
                      :style="{ width: getBarWidth(count, levelStats.pickleball) }"
                    ></div>
                  </div>
                  <div class="level-count">{{ count }}</div>
                </div>
              </div>
            </div>
            
            <div class="chart-container">
              <h4>网球水平分布</h4>
              <div class="level-bars">
                <div 
                  v-for="(count, level) in levelStats.tennis" 
                  :key="`tennis-${level}`"
                  class="level-bar"
                >
                  <div class="level-label">{{ level }}</div>
                  <div class="bar-container">
                    <div 
                      class="bar-fill"
                      :style="{ width: getBarWidth(count, levelStats.tennis) }"
                    ></div>
                  </div>
                  <div class="level-count">{{ count }}</div>
                </div>
              </div>
            </div>
            
            <div class="chart-container">
              <h4>羽毛球水平分布</h4>
              <div class="level-bars">
                <div 
                  v-for="(count, level) in levelStats.badminton" 
                  :key="`badminton-${level}`"
                  class="level-bar"
                >
                  <div class="level-label">{{ level }}</div>
                  <div class="bar-container">
                    <div 
                      class="bar-fill"
                      :style="{ width: getBarWidth(count, levelStats.badminton) }"
                    ></div>
                  </div>
                  <div class="level-count">{{ count }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 用户列表 -->
      <div v-if="activeNav === 'users'" class="list-section">
        <div class="section-header">
          <h2>用户列表</h2>
          <span class="total-count">共 {{ users.length }} 位用户</span>
        </div>
        
        <div class="search-bar">
          <van-search
            v-model="userSearch"
            placeholder="搜索用户昵称或邮箱"
            shape="round"
            @search="searchUsers"
          />
        </div>
        
        <div class="table-container">
          <van-list
            v-model:loading="loading"
            :finished="finished"
            finished-text="没有更多了"
            @load="loadUsers"
          >
            <div class="user-table">
              <div class="table-header">
                <div class="col-nickname">用户昵称</div>
                <div class="col-email">邮箱</div>
                <div class="col-level">运动水平</div>
                <div class="col-time">注册时间</div>
              </div>
              
              <div 
                v-for="user in filteredUsers"
                :key="user.id"
                class="table-row"
              >
                <div class="col-nickname">{{ user.nickname }}</div>
                <div class="col-email">{{ user.email }}</div>
                <div class="col-level">
                  <van-tag 
                    v-if="user.pickleball_level" 
                    type="primary" 
                    size="small"
                  >
                    匹克球: {{ user.pickleball_level }}
                  </van-tag>
                </div>
                <div class="col-time">{{ formatTime(user.created_at) }}</div>
              </div>
            </div>
          </van-list>
        </div>
      </div>

      <!-- 球局列表 -->
      <div v-if="activeNav === 'matches'" class="list-section">
        <div class="section-header">
          <h2>球局列表</h2>
          <span class="total-count">共 {{ matches.length }} 个球局</span>
        </div>
        
        <div class="search-bar">
          <van-search
            v-model="matchSearch"
            placeholder="搜索球局标题或地点"
            shape="round"
            @search="searchMatches"
          />
        </div>
        
        <div class="table-container">
          <van-list
            v-model:loading="loadingMatches"
            :finished="finishedMatches"
            finished-text="没有更多了"
            @load="loadMatches"
          >
            <div class="match-table">
              <div class="table-header">
                <div class="col-title">球局标题</div>
                <div class="col-sport">运动类型</div>
                <div class="col-time">时间</div>
                <div class="col-location">地点</div>
                <div class="col-creator">创建者</div>
                <div class="col-players">参与人数</div>
                <div class="col-actions">操作</div>
              </div>
              
              <div 
                v-for="match in filteredMatches"
                :key="match.id"
                class="table-row"
              >
                <div class="col-title">{{ match.title }}</div>
                <div class="col-sport">
                  <van-tag :color="getSportColor(match.sport)" text-color="white">
                    {{ match.sport }}
                  </van-tag>
                </div>
                <div class="col-time">{{ formatTime(match.time) }}</div>
                <div class="col-location">{{ match.location }}</div>
                <div class="col-creator">{{ match.profiles?.nickname }}</div>
                <div class="col-players">
                  <van-tag type="success" size="small">
                    {{ match.participants_count || 0 }}/{{ match.max_players }}
                  </van-tag>
                </div>
                <div class="col-actions">
                  <van-button 
                    type="danger" 
                    size="mini" 
                    @click="deleteMatch(match)"
                    class="delete-btn"
                  >
                    删除
                  </van-button>
                </div>
              </div>
            </div>
          </van-list>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <van-overlay :show="isLoading">
      <div class="loading-wrapper">
        <van-loading type="spinner" size="24px">加载中...</van-loading>
      </div>
    </van-overlay>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Button as VanButton, 
  List as VanList, 
  Tag as VanTag, 
  Loading as VanLoading, 
  Overlay as VanOverlay, 
  Icon as VanIcon,
  Search as VanSearch,
  showToast,
  showConfirmDialog
} from 'vant'
import { adminApi } from '../utils/adminApi'
import { useUserStore } from '../stores/user'
import { getSportColor } from '../utils/colors'

const router = useRouter()
const userStore = useUserStore()

// 导航配置
const navItems = [
  { id: 'overview', text: '数据总览', icon: 'chart-trending-o' },
  { id: 'users', text: '用户管理', icon: 'friends-o' },
  { id: 'matches', text: '球局管理', icon: 'flag-o' }
]

const activeNav = ref('overview')

// 响应式数据
const isLoading = ref(false)
const loading = ref(false)
const finished = ref(false)
const loadingMatches = ref(false)
const finishedMatches = ref(false)

const users = ref([])
const matches = ref([])
const userStats = ref({
  totalUsers: 0,
  todayUsers: 0,
  activeUsers: 0
})
const matchStats = ref({
  totalMatches: 0,
  todayMatches: 0,
  sportDistribution: {}
})
const levelStats = ref({
  pickleball: {},
  tennis: {},
  badminton: {}
})

// 搜索功能
const userSearch = ref('')
const matchSearch = ref('')

// 过滤后的数据
const filteredUsers = computed(() => {
  if (!userSearch.value) return users.value
  const searchTerm = userSearch.value.toLowerCase()
  return users.value.filter(user => 
    user.nickname?.toLowerCase().includes(searchTerm) ||
    user.email?.toLowerCase().includes(searchTerm)
  )
})

const filteredMatches = computed(() => {
  if (!matchSearch.value) return matches.value
  const searchTerm = matchSearch.value.toLowerCase()
  return matches.value.filter(match => 
    match.title?.toLowerCase().includes(searchTerm) ||
    match.location?.toLowerCase().includes(searchTerm)
  )
})

// 检查管理员权限
const checkAdminPermission = async () => {
  const isAdmin = await adminApi.isAdmin()
  if (!isAdmin) {
    showToast('无管理员权限访问此页面')
    router.push('/home')
    return false
  }
  return true
}

// 导航切换
const switchNav = (navId) => {
  activeNav.value = navId
}

const getNavTitle = (navId) => {
  const nav = navItems.find(item => item.id === navId)
  return nav ? nav.text : '管理员面板'
}

// 加载用户列表
const loadUsers = async () => {
  try {
    loading.value = true
    const { data, error } = await adminApi.getAllUsers()
    
    if (error) {
      showToast('加载用户列表失败：' + error)
      return
    }
    
    users.value = data || []
    finished.value = true
  } catch (error) {
    console.error('加载用户列表失败:', error)
    showToast('加载用户列表失败')
  } finally {
    loading.value = false
  }
}

// 加载球局列表
const loadMatches = async () => {
  try {
    loadingMatches.value = true
    const { data, error } = await adminApi.getAllMatches()
    
    if (error) {
      showToast('加载球局列表失败：' + error)
      return
    }
    
    matches.value = data || []
    finishedMatches.value = true
  } catch (error) {
    console.error('加载球局列表失败:', error)
    showToast('加载球局列表失败')
  } finally {
    loadingMatches.value = false
  }
}

// 加载统计数据
const loadStats = async () => {
  try {
    isLoading.value = true
    
    // 加载用户统计
    const userStatsResult = await adminApi.getUserCountStats()
    if (!userStatsResult.error) {
      userStats.value = userStatsResult.data
    }
    
    // 加载球局统计
    const matchStatsResult = await adminApi.getMatchStats()
    if (!matchStatsResult.error) {
      matchStats.value = matchStatsResult.data
    }
    
    // 加载水平分布统计
    const levelStatsResult = await adminApi.getUserLevelStats()
    if (!levelStatsResult.error) {
      levelStats.value = levelStatsResult.data
    }
    
  } catch (error) {
    console.error('加载统计数据失败:', error)
    showToast('加载统计数据失败')
  } finally {
    isLoading.value = false
  }
}

// 搜索功能
const searchUsers = () => {
  // 搜索逻辑已通过computed属性实现
}

const searchMatches = () => {
  // 搜索逻辑已通过computed属性实现
}

// 刷新数据
const refreshData = async () => {
  const dbConnected = await checkDatabaseConnection()
  if (!dbConnected) return
  
  await loadStats()
  users.value = []
  matches.value = []
  finished.value = false
  finishedMatches.value = false
  await loadUsers()
  await loadMatches()
  showToast('数据已刷新')
}

// 计算柱状图宽度
const getBarWidth = (count, levelData) => {
  const maxCount = Math.max(...Object.values(levelData))
  return maxCount > 0 ? `${(count / maxCount) * 100}%` : '0%'
}

// 格式化时间
const formatTime = (timeString) => {
  if (!timeString) return ''
  const date = new Date(timeString)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

// 退出登录
const handleLogout = () => {
  showConfirmDialog({
    title: '确认退出',
    message: '确定要退出管理员模式吗？',
    className: 'custom-dialog'
  }).then(() => {
    userStore.logout()
    showToast({
      message: '退出成功',
      className: 'custom-toast'
    })
    router.push('/login')
  })
}

// 删除球局
const deleteMatch = async (match) => {
  showConfirmDialog({
    title: '确认删除',
    message: `确定要删除球局"${match.title}"吗？此操作不可恢复。`,
    className: 'custom-dialog'
  }).then(async () => {
    try {
      const { error } = await adminApi.deleteMatch(match.id)
      if (error) {
        showToast('删除失败：' + error)
        return
      }
      
      showToast('球局删除成功')
      // 重新加载球局列表
      matches.value = matches.value.filter(m => m.id !== match.id)
      await loadStats() // 刷新统计数据
    } catch (error) {
      console.error('删除球局失败:', error)
      showToast('删除失败，请重试')
    }
  })
}

// 返回首页
const goBack = () => {
  router.push('/home')
}

// 检查数据库连接状态
const checkDatabaseConnection = async () => {
  try {
    const connectionStatus = await adminApi.checkDatabaseConnection()
    if (!connectionStatus.connected) {
      showToast({
        message: `数据库连接失败: ${connectionStatus.error}`,
        type: 'warning'
      })
      return false
    }
    console.log('数据库连接正常:', connectionStatus)
    return true
  } catch (error) {
    console.error('数据库连接检查失败:', error)
    showToast({
      message: '数据库连接检查失败',
      type: 'warning'
    })
    return false
  }
}

// 实时数据更新（每30秒自动刷新）
let autoRefreshInterval = null
const startAutoRefresh = () => {
  if (autoRefreshInterval) clearInterval(autoRefreshInterval)
  
  autoRefreshInterval = setInterval(async () => {
    if (activeNav.value === 'overview') {
      await loadStats()
    }
  }, 30000) // 30秒刷新一次
}

// 停止自动刷新
const stopAutoRefresh = () => {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval)
    autoRefreshInterval = null
  }
}

// 页面加载时初始化数据
onMounted(async () => {
  const hasPermission = await checkAdminPermission()
  if (hasPermission) {
    const dbConnected = await checkDatabaseConnection()
    if (dbConnected) {
      await loadStats()
      await loadUsers()
      await loadMatches()
      startAutoRefresh()
    }
  }
})

// 页面卸载时清理资源
onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped>
.admin-dashboard {
  display: flex;
  min-height: 100vh;
  background-color: #f8f9fa;
}

/* 侧边栏样式 */
.sidebar {
  width: 280px;
  background: linear-gradient(135deg, #5999da 50%, #90d6ff 50%);
  color: white;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(142, 113, 113, 0.1);
}

.sidebar-header {
  padding: 30px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-header h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
}

.sidebar-header p {
  margin: 0;
  font-size: 14px;
  opacity: 0.8;
}

.sidebar-nav {
  flex: 1;
  padding: 20px 0;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.nav-item.active {
  background: rgba(52, 152, 219, 0.2);
  border-left-color: #7abce8;
}

.nav-icon {
  font-size: 18px;
  margin-right: 12px;
  opacity: 0.9;
}

.nav-text {
  font-size: 16px;
  font-weight: 500;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.logout-btn {
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  background: transparent;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* 主内容区域样式 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.top-nav {
  background: white;
  padding: 16px 24px;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.nav-left h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #209ff3;
}

.nav-right {
  display: flex;
  gap: 12px;
}

/* 数据概览区域 */
.overview-section {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 24px;
}

.user-icon { background: linear-gradient(135deg, #3498db, #52a1d5); }
.new-user-icon { background: linear-gradient(135deg, #2ecc71, #3ec174); }
.active-icon { background: linear-gradient(135deg, #d4746a, #d26a5f); }
.match-icon { background: linear-gradient(135deg, #9b59b6, #aa62c9); }
.new-match-icon { background: linear-gradient(135deg, #f39c12, #d28755); }
.sport-icon { background: linear-gradient(135deg, #1abc9c, #38dcbb); }

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #557c7e;
  font-weight: 500;
}

/* 图表区域 */
.chart-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.chart-section h3 {
  margin: 0 0 24px 0;
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
}

.level-charts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
}

.chart-container {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
}

.chart-container h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #34495e;
}

.level-bars {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.level-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.level-label {
  min-width: 80px;
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
}

.bar-container {
  flex: 1;
  height: 12px;
  background-color: #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #3498db, #2ecc71);
  border-radius: 6px;
  transition: width 0.5s ease;
}

.level-count {
  min-width: 40px;
  font-size: 14px;
  font-weight: 600;
  text-align: right;
  color: #7f8c8d;
}

/* 列表区域 */
.list-section {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
}

.total-count {
  font-size: 14px;
  color: #7f8c8d;
  font-weight: 500;
}

.search-bar {
  margin-bottom: 24px;
}

.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.user-table, .match-table {
  width: 100%;
}

.table-header {
  display: grid;
  background: #f8f9fa;
  padding: 16px 24px;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 1px solid #e8e8e8;
}

.user-table .table-header {
  grid-template-columns: 1fr 1fr 1fr 200px;
}

.match-table .table-header {
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 80px 120px;
}

.table-row {
  display: grid;
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s ease;
}

.table-row:hover {
  background-color: #f8f9fa;
}

.user-table .table-row {
  grid-template-columns: 1fr 1fr 1fr 200px;
}

.match-table .table-row {
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 80px 120px;
}

.col-nickname, .col-email, .col-level, .col-time,
.col-title, .col-sport, .col-location, .col-creator, .col-players, .col-actions {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #34495e;
}

/* 删除按钮样式 */
.delete-btn {
  background: linear-gradient(135deg, #e74c3c, #c0392b) !important;
  border: none !important;
  color: white !important;
  font-weight: 500;
  transition: all 0.3s ease;
}

.delete-btn:hover {
  background: linear-gradient(135deg, #c0392b, #cd5045) !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(231, 76, 60, 0.3);
}

.delete-btn:active {
  transform: translateY(0);
}

/* 加载状态 */
.loading-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }
  
  .level-charts {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .admin-dashboard {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    height: auto;
  }
  
  .sidebar-nav {
    display: flex;
    padding: 0;
  }
  
  .nav-item {
    flex: 1;
    justify-content: center;
    border-left: none;
    border-bottom: 4px solid transparent;
  }
  
  .nav-item.active {
    border-left: none;
    border-bottom-color: #3498db;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .user-table .table-header,
  .user-table .table-row,
  .match-table .table-header,
  .match-table .table-row {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .table-header > div,
  .table-row > div {
    justify-content: space-between;
    padding: 4px 0;
  }
  
  .table-header > div::before,
  .table-row > div::before {
    content: attr(class);
    font-weight: 600;
    color: #7f8c8d;
    text-transform: capitalize;
  }
}
</style>