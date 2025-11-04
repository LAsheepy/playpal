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
        <div class="participants-grid">
          <div 
            v-for="participant in matchDetail.participants" 
            :key="participant.id"
            class="participant-card"
            @click="viewParticipantProfile(participant)"
          >
            <van-image
              round
              width="48"
              height="48"
              :src="participant.avatar || '/default-avatar.jpg'"
            />
            <div class="participant-details">
              <div class="participant-name-row">
                <span class="participant-name">{{ participant.nickname }}</span>
                <van-tag 
                  v-if="participant.id === matchDetail.creator.id" 
                  type="primary" 
                  size="mini"
                >
                  发起人
                </van-tag>
              </div>
              <span class="participant-level" :style="{ 
                backgroundColor: getLevelColor(participant.level),
                color: getLevelTextColor(participant.level)
              }">
                {{ participant.level }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 对战功能 -->
      <div class="battle-card" v-if="isJoined && matchDetail.participants.length >= 2">
        <div class="card-header">
          <h3>对战记录</h3>
          <van-button 
            type="primary" 
            size="small"
            @click="openBattleDialog"
          >
            新建对战
          </van-button>
        </div>
        
        <!-- 对战记录列表 -->
        <div class="battle-list" v-if="battles.length > 0">
          <div 
            v-for="battle in battles" 
            :key="battle.id"
            class="battle-item"
          >
            <div class="battle-header">
              <div class="battle-mode">
                <van-tag 
                  :type="battle.team_a.length > 1 || battle.team_b.length > 1 ? 'primary' : 'default'"
                  size="small"
                >
                  {{ battle.team_a.length > 1 || battle.team_b.length > 1 ? '双打' : '单打' }}
                </van-tag>
              </div>
              <div class="battle-actions">
                <van-button 
                  type="default" 
                  size="mini"
                  @click="editBattle(battle)"
                >
                  编辑
                </van-button>
              </div>
            </div>
            
            <div class="battle-content">
              <div class="battle-teams">
                <div class="team team-a">
                  <div class="team-players">
                    <span 
                      v-for="player in battle.team_a" 
                      :key="player.participant.id"
                      class="player-name"
                    >
                      {{ player.participant.nickname }}
                    </span>
                  </div>
                </div>
                
                <div class="battle-score">
                  <span class="score">{{ battle.score_a || 0 }} : {{ battle.score_b || 0 }}</span>
                  <div class="winner-tag" v-if="battle.winner_team">
                    {{ battle.winner_team === 'A' ? 'A队胜' : 'B队胜' }}
                  </div>
                </div>
                
                <div class="team team-b">
                  <div class="team-players">
                    <span 
                      v-for="player in battle.team_b" 
                      :key="player.participant.id"
                      class="player-name"
                    >
                      {{ player.participant.nickname }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="no-battles" v-else>
          <p>暂无对战记录，点击"新建对战"开始记录</p>
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

    <!-- 对战弹窗 -->
    <van-popup v-model:show="showBattleDialog" position="bottom" round :style="{ height: '75%' }">
      <div class="battle-dialog">
        <div class="dialog-header">
          <h3>{{ editingBattle ? '编辑对战' : '新建对战' }}</h3>
          <van-button type="primary" size="small" @click="saveBattle">保存</van-button>
        </div>
        
        <div class="dialog-content">
          <!-- 对战模式选择 -->
          <div class="mode-selection">
            <h4>对战模式</h4>
            <van-radio-group v-model="battleForm.mode" direction="horizontal">
              <van-radio name="singles">单打</van-radio>
              <van-radio name="doubles">双打</van-radio>
            </van-radio-group>
          </div>
          
          <!-- 队伍选择 -->
          <div class="team-selection">
            <div class="team-section">
              <h4>A队成员</h4>
              <div class="team-members">
                <div 
                  v-for="participant in matchDetail.participants" 
                  :key="participant.id"
                  class="member-item"
                  :class="{ selected: battleForm.teamA.includes(participant.id) }"
                  @click="toggleTeamMember('teamA', participant.id)"
                >
                  {{ participant.nickname }}
                </div>
              </div>
            </div>
            
            <div class="team-section">
              <h4>B队成员</h4>
              <div class="team-members">
                <div 
                  v-for="participant in matchDetail.participants" 
                  :key="participant.id"
                  class="member-item"
                  :class="{ selected: battleForm.teamB.includes(participant.id) }"
                  @click="toggleTeamMember('teamB', participant.id)"
                >
                  {{ participant.nickname }}
                </div>
              </div>
            </div>
          </div>
          
          <!-- 比分输入 -->
          <div class="score-input">
            <h4>比分</h4>
            <div class="score-fields">
              <van-field
                v-model="battleForm.scoreA"
                placeholder="A队得分"
                type="number"
                label="A队"
              />
              <span class="score-separator">:</span>
              <van-field
                v-model="battleForm.scoreB"
                placeholder="B队得分"
                type="number"
                label="B队"
              />
            </div>
          </div>
        </div>
      </div>
    </van-popup>
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
  Tag as VanTag,
  Popup as VanPopup,
  Field as VanField,
  Picker as VanPicker,
  Radio as VanRadio,
  RadioGroup as VanRadioGroup
} from 'vant'
import { getSportColor, getLevelColor, getLevelTextColor } from '../utils/colors'
import { battleApi } from '../utils/supabase'

const route = useRoute()
const router = useRouter()
const matchStore = useMatchStore()
const userStore = useUserStore()

const matchDetail = ref(null)
const battles = ref([])
const showBattleDialog = ref(false)
const editingBattle = ref(null)
const battleForm = ref({
  mode: 'singles',
  teamA: [],
  teamB: [],
  scoreA: '',
  scoreB: ''
})

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

const participantOptions = computed(() => {
  if (!matchDetail.value) return []
  return matchDetail.value.participants.map(p => ({
    text: p.nickname,
    value: p.id
  }))
})

// Picker值处理
const teamAValue = computed({
  get: () => battleForm.value.teamA,
  set: (value) => {
    battleForm.value.teamA = Array.isArray(value) ? value : [value]
  }
})

const teamBValue = computed({
  get: () => battleForm.value.teamB,
  set: (value) => {
    battleForm.value.teamB = Array.isArray(value) ? value : [value]
  }
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

// 切换队伍成员
const toggleTeamMember = (team, participantId) => {
  const currentTeam = battleForm.value[team]
  const maxCount = battleForm.value.mode === 'doubles' ? 2 : 1
  
  if (currentTeam.includes(participantId)) {
    // 如果已选中，则移除
    battleForm.value[team] = currentTeam.filter(id => id !== participantId)
  } else {
    // 如果未选中，检查是否达到最大人数
    if (currentTeam.length >= maxCount) {
      showToast({
        message: `${team === 'teamA' ? 'A队' : 'B队'}最多只能选择${maxCount}人`,
        className: 'custom-toast'
      })
      return
    }
    // 检查是否已经在另一队
    const otherTeam = team === 'teamA' ? battleForm.value.teamB : battleForm.value.teamA
    if (otherTeam.includes(participantId)) {
      showToast({
        message: '该成员已在另一队中',
        className: 'custom-toast'
      })
      return
    }
    
    battleForm.value[team] = [...currentTeam, participantId]
  }
}

// 对战相关方法
const openBattleDialog = () => {
  battleForm.value = {
    mode: 'singles',
    teamA: [],
    teamB: [],
    scoreA: '',
    scoreB: ''
  }
  editingBattle.value = null
  showBattleDialog.value = true
}

const editBattle = (battle) => {
  // 根据队伍人数判断对战模式
  const isDoubles = battle.team_a.length > 1 || battle.team_b.length > 1
  
  battleForm.value = {
    mode: isDoubles ? 'doubles' : 'singles',
    teamA: battle.team_a.map(p => p.participant.id),
    teamB: battle.team_b.map(p => p.participant.id),
    scoreA: battle.score_a || '',
    scoreB: battle.score_b || ''
  }
  editingBattle.value = battle
  showBattleDialog.value = true
}

const saveBattle = async () => {
  // 验证表单
  if (battleForm.value.teamA.length === 0 || battleForm.value.teamB.length === 0) {
    showToast({
      message: '请选择对战成员',
      className: 'custom-toast'
    })
    return
  }
  
  if (!battleForm.value.scoreA || !battleForm.value.scoreB) {
    showToast({
      message: '请输入比分',
      className: 'custom-toast'
    })
    return
  }
  
  // 确定获胜队伍
  const scoreA = parseInt(battleForm.value.scoreA)
  const scoreB = parseInt(battleForm.value.scoreB)
  const winnerTeam = scoreA > scoreB ? 'A' : 'B'
  
  try {
    if (editingBattle.value) {
      // 更新对战
      const { error } = await battleApi.updateBattleScore(
        editingBattle.value.id,
        scoreA,
        scoreB,
        winnerTeam
      )
      
      if (error) throw error
      
      showToast({
        message: '对战记录更新成功',
        className: 'custom-toast'
      })
    } else {
      // 创建对战 - 使用matches表存储对战记录，通过type字段区分
      const battleData = {
        parent_match_id: matchDetail.value.id, // 关联到主球局
        type: 'battle', // 标记为对战记录
        title: `${matchDetail.value.title} - 对战记录`,
        sport: matchDetail.value.sport,
        score_a: scoreA,
        score_b: scoreB,
        winner_team: winnerTeam,
        creator_id: userStore.userInfo.id,
        time: new Date().toISOString(),
        location: matchDetail.value.location,
        max_players: battleForm.value.teamA.length + battleForm.value.teamB.length,
        current_players: battleForm.value.teamA.length + battleForm.value.teamB.length
      }
      
      const { data, error } = await battleApi.createBattle(battleData)
      
      if (error) throw error
      
      // 创建对战参与者记录
      if (data && data[0]) {
        const battleId = data[0].id
        
        // 创建A队参与者记录
        for (const participantId of battleForm.value.teamA) {
          await supabase
            .from('match_participants')
            .insert([{ match_id: battleId, participant_id: participantId, team: 'A' }])
        }
        
        // 创建B队参与者记录
        for (const participantId of battleForm.value.teamB) {
          await supabase
            .from('match_participants')
            .insert([{ match_id: battleId, participant_id: participantId, team: 'B' }])
        }
      }
      
      showToast({
        message: '对战记录创建成功',
        className: 'custom-toast'
      })
    }
    
    // 刷新对战记录
    await loadBattles()
    showBattleDialog.value = false
  } catch (error) {
    console.error('保存对战记录失败:', error)
    showToast({
      message: '保存失败，请重试',
      className: 'custom-toast'
    })
  }
}

const loadBattles = async () => {
  if (!matchDetail.value) return
  
  try {
    const { data, error } = await battleApi.getMatchBattles(matchDetail.value.id)
    
    if (error) throw error
    
    battles.value = data || []
  } catch (error) {
    console.error('加载对战记录失败:', error)
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

.participants-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
}

.participant-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 12px;
  border-radius: 8px;
  background-color: #f8f9fa;
  transition: background-color 0.2s;
}

.participant-card:active {
  background-color: #e9ecef;
}

.participant-details {
  margin-top: 8px;
  width: 100%;
}

.participant-name-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-bottom: 4px;
}

.participant-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80px;
}

.participant-level {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 8px;
  min-width: 32px;
  text-align: center;
  font-weight: bold;
  display: inline-block;
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
/* 对战功能样式 */
.battle-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.battle-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.battle-card .card-header h3 {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.battle-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
}

.battle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.battle-mode {
  flex: 1;
}

.battle-content {
  margin-top: 8px;
}

.battle-teams {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.team {
  flex: 1;
  text-align: center;
  min-width: 0;
}

.team-players {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.player-name {
  font-size: 13px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.battle-score {
  flex: 0 0 auto;
  text-align: center;
  padding: 0 12px;
}

.score {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.winner-tag {
  font-size: 11px;
  color: #07c160;
  font-weight: bold;
  margin-top: 2px;
}

.battle-actions {
  flex-shrink: 0;
}

.no-battles {
  text-align: center;
  padding: 40px 0;
  color: #999;
}

/* 对战弹窗样式 */
.battle-dialog {
  padding: 16px;
  max-height: 100%;
  overflow-y: auto;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.dialog-header h3 {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.mode-selection {
  margin-bottom: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.mode-selection h4 {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.team-selection {
  margin-bottom: 16px;
}

.team-section {
  margin-bottom: 12px;
}

.team-section h4 {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.score-input {
  margin-bottom: 16px;
}

.score-input h4 {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.score-fields {
  display: flex;
  align-items: center;
  gap: 12px;
}

.score-separator {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

/* 队伍成员选择样式 */
.team-members {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
  margin-top: 8px;
}

.member-item {
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  text-align: center;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
}

.member-item:hover {
  border-color: #1989fa;
}

.member-item.selected {
  background: #1989fa;
  color: white;
  border-color: #1989fa;
}

.member-item:active {
  transform: scale(0.95);
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