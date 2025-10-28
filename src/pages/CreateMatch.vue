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
            v-model="form.sport"
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
  Stepper as VanStepper
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
const tempTime = ref(new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16))

// 选项数据
const sportOptions = [
  { text: '匹克球', value: '匹克球' },
  { text: '网球', value: '网球' },
  { text: '羽毛球', value: '羽毛球' }
]

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
  const selectedValue = value.value || value
  form.sport = selectedValue
  console.log('球种已选择:', form.sport)
  showSportPicker.value = false
}

// 格式化显示时间
const formatDisplayTime = (timeStr) => {
  try {
    // 处理 datetime-local 格式（YYYY-MM-DDTHH:mm）
    if (timeStr.includes('T')) {
      const date = new Date(timeStr)
      if (isNaN(date.getTime())) {
        return '时间格式错误'
      }
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    // 处理标准 ISO 格式
    const date = new Date(timeStr)
    if (isNaN(date.getTime())) {
      return '时间格式错误'
    }
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    console.error('时间格式化错误:', error)
    return '时间格式错误'
  }
}

// 确认时间选择
const confirmTime = () => {
  if (tempTime.value) {
    form.time = tempTime.value
    console.log('时间已选择:', form.time)
  } else {
    // 如果没有选择时间，设置默认时间为当前时间+1小时
    const defaultTime = new Date()
    defaultTime.setHours(defaultTime.getHours() + 1)
    form.time = defaultTime.toISOString().slice(0, 16)
    tempTime.value = form.time
    console.log('使用默认时间:', form.time)
  }
  showTimePicker.value = false
}

// 确认人数选择
const confirmPlayerCount = () => {
  form.maxPlayers = tempPlayerCount.value
  console.log('人数已选择:', form.maxPlayers)
  showPlayerPicker.value = false
}

// 处理时间变化
const handleTimeChange = () => {
  if (tempTime.value) {
    form.time = tempTime.value
    console.log('时间已更新:', form.time)
  }
}



// 提交表单
const onSubmit = async () => {
  try {
    // 验证登录状态
    if (!userStore.isLoggedIn) {
      showToast('请先登录')
      router.push('/login')
      return
    }

    // 游客模式下不允许创建球局
    if (userStore.isGuestMode) {
      showToast('游客模式下无法创建球局，请注册账号后使用完整功能')
      return
    }

    // 验证必填字段
    const requiredFields = [
      { field: form.title, message: '请输入球局标题' },
      { field: form.sport, message: '请选择球种' },
      { field: form.time, message: '请选择时间' },
      { field: form.location, message: '请输入地点' },
      { field: form.maxPlayers, message: '请选择人数上限' }
    ]

    for (const { field, message } of requiredFields) {
      if (!field) {
        showToast(message)
        return
      }
    }

    // 验证标题长度
    if (form.title.length < 2 || form.title.length > 50) {
      showToast('球局标题长度应在2-50个字符之间')
      return
    }

    // 验证地点长度
    if (form.location.length < 2 || form.location.length > 100) {
      showToast('地点长度应在2-100个字符之间')
      return
    }

    // 验证时间格式和有效性
    const selectedTime = new Date(form.time)
    const currentTime = new Date()
    
    if (isNaN(selectedTime.getTime())) {
      showToast('时间格式无效，请重新选择')
      return
    }
    
    if (selectedTime <= currentTime) {
      showToast('请选择未来的时间')
      return
    }

    // 验证时间不能超过一年
    const maxTime = new Date()
    maxTime.setFullYear(maxTime.getFullYear() + 1)
    if (selectedTime > maxTime) {
      showToast('时间不能超过一年后')
      return
    }

    // 验证人数范围
    if (form.maxPlayers < 1 || form.maxPlayers > 12) {
      showToast('人数上限应在1-12人之间')
      return
    }

    // 验证描述长度
    if (form.description && form.description.length > 200) {
      showToast('描述长度不能超过200个字符')
      return
    }

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
    console.error('创建球局异常:', error)
    showToast({
      message: '创建失败，请检查网络连接后重试',
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