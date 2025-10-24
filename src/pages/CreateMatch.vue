<template>
  <div class="create-match-container">
    <van-nav-bar
      title="创建球局"
      left-text="返回"
      left-arrow
      @click-left="goBack"
    />
    
    <div class="form-container">
      <van-form @submit="onSubmit">
        <!-- 球种选择 -->
        <van-cell-group title="基本信息">
          <van-field
            v-model="form.title"
            name="title"
            label="球局标题"
            placeholder="请输入球局标题"
            :rules="[{ required: true, message: '请输入球局标题' }]"
          />
          
          <van-field
            readonly
            clickable
            name="sport"
            label="球种"
            :value="form.sport"
            placeholder="请选择球种"
            @click="showSportPicker = true"
            :rules="[{ required: true, message: '请选择球种' }]"
          />
          
          <van-popup v-model:show="showSportPicker" position="bottom">
            <van-picker
              :columns="sportOptions"
              @confirm="onSportConfirm"
              @cancel="showSportPicker = false"
            />
          </van-popup>
        </van-cell-group>

        <!-- 时间地点 -->
        <van-cell-group title="时间地点">
          <van-field
            readonly
            clickable
            name="time"
            label="时间"
            :value="form.time ? formatDisplayTime(form.time) : '请选择时间'"
            placeholder="请选择时间"
            @click="showTimePicker = true"
            :rules="[{ required: true, message: '请选择时间' }]"
          />
          
          <van-popup v-model:show="showTimePicker" position="bottom" :style="{ height: '40%' }" round>
            <div class="time-picker-container">
              <div class="time-picker-header">
                <span class="picker-title">选择时间</span>
                <van-button size="small" type="primary" @click="confirmTime">确定</van-button>
              </div>
              <div class="time-input-wrapper">
                <input
                  v-model="tempTime"
                  type="datetime-local"
                  :min="getMinDateTime()"
                  :max="getMaxDateTime()"
                  class="datetime-input"
                  @change="handleTimeChange"
                />
              </div>
            </div>
          </van-popup>
          
          <van-field
            v-model="form.location"
            name="location"
            label="地点"
            placeholder="请输入具体地点"
            :rules="[{ required: true, message: '请输入地点' }]"
          />
        </van-cell-group>

        <!-- 人数设置 -->
        <van-cell-group title="人数设置">
          <van-field
            readonly
            clickable
            name="maxPlayers"
            label="人数上限"
            :value="form.maxPlayers ? form.maxPlayers + '人' : '请选择人数上限'"
            placeholder="请选择人数上限"
            @click="showPlayerPicker = true"
            :rules="[{ required: true, message: '请选择人数上限' }]"
          />
          
          <van-popup v-model:show="showPlayerPicker" position="bottom" :style="{ height: '30%' }" round>
            <div class="player-picker-container">
              <div class="picker-header">
                <span class="picker-title">选择人数上限</span>
                <van-button size="small" type="primary" @click="confirmPlayerCount">确定</van-button>
              </div>
              <div class="number-input-wrapper">
                <van-stepper
                  v-model="tempPlayerCount"
                  :min="1"
                  :max="12"
                  integer
                  button-size="32px"
                />
                <span class="player-count-label">{{ tempPlayerCount }}人</span>
              </div>
            </div>
          </van-popup>
        </van-cell-group>

        <!-- 备注信息 -->
        <van-cell-group title="备注信息">
          <van-field
            v-model="form.description"
            rows="3"
            autosize
            type="textarea"
            maxlength="200"
            placeholder="请输入球局说明（可选）"
            show-word-limit
          />
        </van-cell-group>

        <!-- 提交按钮 -->
        <div style="margin: 16px;">
          <van-button round block type="primary" native-type="submit">
            创建球局
          </van-button>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMatchStore } from '../stores/match'
import { useUserStore } from '../stores/user'
import { 
  showToast,
  NavBar as VanNavBar,
  Form as VanForm,
  Field as VanField,
  CellGroup as VanCellGroup,
  Popup as VanPopup,
  Picker as VanPicker,
  Button as VanButton,
  Slider as VanSlider
} from 'vant'

const router = useRouter()
const matchStore = useMatchStore()
const userStore = useUserStore()

// 表单数据
const form = reactive({
  title: '',
  sport: '',
  time: '',
  location: '',
  maxPlayers: 4,
  description: ''
})

// 选择器状态
const showSportPicker = ref(false)
const showTimePicker = ref(false)
const showPlayerPicker = ref(false)

// 临时数据
const tempPlayerCount = ref(4)
const tempTime = ref('')

// 选项数据
const sportOptions = ['匹克球', '网球', '羽毛球']

// 获取最小日期时间（当前时间）
const getMinDateTime = () => {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
}

// 获取最大日期时间（一年后）
const getMaxDateTime = () => {
  const maxDate = new Date()
  maxDate.setFullYear(maxDate.getFullYear() + 1)
  maxDate.setMinutes(maxDate.getMinutes() - maxDate.getTimezoneOffset())
  return maxDate.toISOString().slice(0, 16)
}

// 球种确认
const onSportConfirm = (value) => {
  form.sport = value
  showSportPicker.value = false
}

// 格式化显示时间
const formatDisplayTime = (timeStr) => {
  const date = new Date(timeStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 确认时间选择
const confirmTime = () => {
  if (tempTime.value) {
    form.time = tempTime.value
  } else {
    // 如果没有选择时间，设置默认时间为当前时间+1小时
    const defaultTime = new Date()
    defaultTime.setHours(defaultTime.getHours() + 1)
    form.time = defaultTime.toISOString().slice(0, 16)
  }
  showTimePicker.value = false
}

// 确认人数选择
const confirmPlayerCount = () => {
  form.maxPlayers = tempPlayerCount.value
  showPlayerPicker.value = false
}

// 处理时间变化
const handleTimeChange = () => {
  if (tempTime.value) {
    form.time = tempTime.value
  }
}



// 提交表单
const onSubmit = async () => {
  if (!userStore.isLoggedIn) {
    showToast('请先登录')
    router.push('/login')
    return
  }

  // 验证必填字段
  if (!form.title || !form.sport || !form.time || !form.location || !form.maxPlayers) {
    showToast('请完善所有必填信息')
    return
  }

  try {
    const result = await matchStore.createMatch(form)
    
    if (result.success) {
      showToast({
        message: '创建成功',
        type: 'success'
      })

      // 跳转到球局详情页
      setTimeout(() => {
        if (result.data && result.data.id) {
          router.push(`/match/${result.data.id}`)
        } else {
          // 如果返回的数据中没有id，跳转到首页
          router.push('/home')
        }
      }, 1000)
    } else {
      showToast({
        message: result.error || '创建失败，请重试',
        type: 'fail'
      })
    }
  } catch (error) {
    showToast({
      message: '创建失败，请重试',
      type: 'fail'
    })
  }
}

// 返回
const goBack = () => {
  router.back()
}

onMounted(() => {
  // 检查登录状态
  if (!userStore.isLoggedIn) {
    router.push('/login')
  }
})
</script>

<style scoped>
.create-match-container {
  height: 100vh;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
}

.form-container {
  flex: 1;
  overflow-y: auto;
}

:deep(.van-cell-group__title) {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin: 16px 0 8px 16px;
}

:deep(.van-field__label) {
  width: 80px;
  text-align: right;
  margin-right: 12px;
}

.time-picker-container {
  background: white;
}

.time-picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #ebedf0;
}

.picker-title {
  font-size: 16px;
  font-weight: bold;
}

.time-input-wrapper {
  padding: 16px;
}

.datetime-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
}

.player-picker-container {
  background: white;
}

.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #ebedf0;
}

.number-input-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 16px;
  gap: 16px;
}

.player-count-label {
  font-size: 18px;
  font-weight: bold;
  color: #1989fa;
}
</style>