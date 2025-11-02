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
              :default-index="0"
              value-key="text"
            />
          </van-popup>
        </van-cell-group>

        <!-- 时间地点 -->
        <van-cell-group title="时间地点">
          <div class="time-input-group">
            <div class="time-input-row">
              <van-field
                v-model="form.year"
                name="year"
                label="年"
                placeholder="2024"
                type="number"
                :rules="[{ required: true, message: '请输入年份' }]"
                @blur="validateYear"
              />
              <span class="time-unit">年</span>
              <van-field
                v-model="form.month"
                name="month"
                label="月"
                placeholder="12"
                type="number"
                :rules="[{ required: true, message: '请输入月份' }]"
                @blur="validateMonth"
              />
              <span class="time-unit">月</span>
              <van-field
                v-model="form.day"
                name="day"
                label="日"
                placeholder="25"
                type="number"
                :rules="[{ required: true, message: '请输入日期' }]"
                @blur="validateDay"
              />
              <span class="time-unit">日</span>
            </div>
            <div class="time-input-row">
              <van-field
                v-model="form.hour"
                name="hour"
                label="时"
                placeholder="14"
                type="number"
                :rules="[{ required: true, message: '请输入小时' }]"
                @blur="validateHour"
              />
              <span class="time-unit">时</span>
              <van-field
                v-model="form.minute"
                name="minute"
                label="分"
                placeholder="30"
                type="number"
                :rules="[{ required: true, message: '请输入分钟' }]"
                @blur="validateMinute"
              />
              <span class="time-unit">分</span>
            </div>
            <div class="time-validation">
              <span v-if="timeValidationMessage" class="validation-message">{{ timeValidationMessage }}</span>
              <span v-else class="validation-success">✓ 时间格式正确</span>
            </div>
          </div>
          
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
            v-model="maxPlayersDisplay"
            placeholder="请选择人数上限"
            @click="showPlayerPicker = true"
            :rules="[{ required: true, message: '请选择人数上限' }]"
          />
          
          <van-popup v-model:show="showPlayerPicker" position="bottom" :style="{ height: '30%' }" round>
            <div class="player-picker-container">
              <div class="picker-header">
                <span class="picker-title">选择人数上限</span>
                <div>
                  <van-button size="small" plain @click="cancelPlayerCount" style="margin-right: 8px;">取消</van-button>
                  <van-button size="small" type="primary" @click="confirmPlayerCount">确定</van-button>
                </div>
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
import { ref, reactive, onMounted, computed } from 'vue'
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
  year: '',
  month: '',
  day: '',
  hour: '',
  minute: '',
  location: '',
  maxPlayers: 4,
  description: ''
})

// 时间验证消息
const timeValidationMessage = ref('')

// 计算属性：显示人数上限
const maxPlayersDisplay = computed(() => {
  return form.maxPlayers ? form.maxPlayers + '人' : '请选择人数上限'
})

// 选择器状态
const showSportPicker = ref(false)
const showPlayerPicker = ref(false)

// 临时数据
const tempPlayerCount = ref(4)

// 初始化表单数据
const initFormData = () => {
  console.log('=== 初始化表单数据 ===')
  
  // 设置默认人数上限
  form.maxPlayers = 4
  tempPlayerCount.value = 4
  
  // 设置默认时间为当前系统时间（未来1小时）
  const currentTime = new Date()
  currentTime.setHours(currentTime.getHours() + 1) // 设置为未来1小时
  
  form.year = currentTime.getFullYear().toString()
  form.month = (currentTime.getMonth() + 1).toString()
  form.day = currentTime.getDate().toString()
  form.hour = currentTime.getHours().toString()
  form.minute = currentTime.getMinutes().toString()
  
  // 设置默认球种
  form.sport = '匹克球'
  
  console.log('初始化表单数据:', {
    title: form.title,
    sport: form.sport,
    year: form.year,
    month: form.month,
    day: form.day,
    hour: form.hour,
    minute: form.minute,
    location: form.location,
    maxPlayers: form.maxPlayers
  })
  
  // 验证时间格式
  validateTime()
}

// 验证年份
const validateYear = () => {
  const year = parseInt(form.year)
  const currentYear = new Date().getFullYear()
  
  if (!form.year || isNaN(year)) {
    timeValidationMessage.value = '请输入有效的年份'
    return false
  }
  
  if (year < currentYear || year > currentYear + 5) {
    timeValidationMessage.value = '年份应在' + currentYear + '到' + (currentYear + 5) + '之间'
    return false
  }
  
  validateTime()
  return true
}

// 验证月份
const validateMonth = () => {
  const month = parseInt(form.month)
  
  if (!form.month || isNaN(month) || month < 1 || month > 12) {
    timeValidationMessage.value = '请输入有效的月份（1-12）'
    return false
  }
  
  validateTime()
  return true
}

// 验证日期
const validateDay = () => {
  const day = parseInt(form.day)
  const year = parseInt(form.year)
  const month = parseInt(form.month)
  
  if (!form.day || isNaN(day) || day < 1 || day > 31) {
    timeValidationMessage.value = '请输入有效的日期（1-31）'
    return false
  }
  
  // 验证具体月份的天数
  if (year && month) {
    const daysInMonth = new Date(year, month, 0).getDate()
    if (day > daysInMonth) {
      timeValidationMessage.value = month + '月最多有' + daysInMonth + '天'
      return false
    }
  }
  
  validateTime()
  return true
}

// 验证小时
const validateHour = () => {
  const hour = parseInt(form.hour)
  
  if (!form.hour || isNaN(hour) || hour < 0 || hour > 23) {
    timeValidationMessage.value = '请输入有效的小时（0-23）'
    return false
  }
  
  validateTime()
  return true
}

// 验证分钟
const validateMinute = () => {
  const minute = parseInt(form.minute)
  
  if (!form.minute || isNaN(minute) || minute < 0 || minute > 59) {
    timeValidationMessage.value = '请输入有效的分钟（0-59）'
    return false
  }
  
  validateTime()
  return true
}

// 验证完整时间
const validateTime = () => {
  console.log('验证时间字段:', {
    year: form.year,
    month: form.month,
    day: form.day,
    hour: form.hour,
    minute: form.minute
  })
  
  if (!form.year || !form.month || !form.day || !form.hour || !form.minute) {
    timeValidationMessage.value = '请完整填写时间信息'
    console.log('时间验证失败: 字段不完整')
    return false
  }
  
  const year = parseInt(form.year)
  const month = parseInt(form.month)
  const day = parseInt(form.day)
  const hour = parseInt(form.hour)
  const minute = parseInt(form.minute)
  
  if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour) || isNaN(minute)) {
    timeValidationMessage.value = '请填写有效的时间格式'
    console.log('时间验证失败: 数字格式无效')
    return false
  }
  
  // 验证日期有效性
  const selectedTime = new Date(year, month - 1, day, hour, minute)
  if (isNaN(selectedTime.getTime())) {
    timeValidationMessage.value = '时间格式无效'
    console.log('时间验证失败: 日期对象无效')
    return false
  }
  
  // 验证是否为未来时间
  const currentTime = new Date()
  if (selectedTime <= currentTime) {
    timeValidationMessage.value = '请选择未来的时间'
    console.log('时间验证失败: 不是未来时间', {
      selected: selectedTime.toISOString(),
      current: currentTime.toISOString()
    })
    return false
  }
  
  // 验证时间不能超过一年
  const maxTime = new Date()
  maxTime.setFullYear(maxTime.getFullYear() + 1)
  if (selectedTime > maxTime) {
    timeValidationMessage.value = '时间不能超过一年后'
    console.log('时间验证失败: 超过一年')
    return false
  }
  
  timeValidationMessage.value = ''
  console.log('时间验证成功')
  return true
}

// 选项数据
const sportOptions = [
  { text: '匹克球', value: '匹克球' },
  { text: '网球', value: '网球' },
  { text: '羽毛球', value: '羽毛球' }
]

// 球种确认
const onSportConfirm = (value, index) => {
  console.log('球种选择器返回值:', value, '索引:', index)
  
  let selectedValue = ''
  
  // 处理Vant Picker返回的不同格式
  if (Array.isArray(value)) {
    // 如果是数组，取第一个值
    selectedValue = value[0]
  } else if (value && typeof value === 'object') {
    // 如果是对象，尝试提取值
    if (value.selectedValues && Array.isArray(value.selectedValues)) {
      selectedValue = value.selectedValues[0]
    } else if (value.value) {
      selectedValue = value.value
    } else if (value.text) {
      selectedValue = value.text
    }
  } else if (typeof value === 'string') {
    // 如果是字符串，直接使用
    selectedValue = value
  }
  
  console.log('提取的球种值:', selectedValue)
  
  // 确保选择的值在有效选项中
  const validOption = sportOptions.find(option => 
    option.value === selectedValue || option.text === selectedValue
  )
  
  if (validOption) {
    form.sport = validOption.value
    console.log('✅ 球种已选择:', form.sport)
  } else {
    // 如果无法匹配，使用默认值
    form.sport = sportOptions[0].value
    console.warn('❌ 无效的球种选择，使用默认值:', form.sport)
  }
  
  showSportPicker.value = false
}



// 确认人数选择
const confirmPlayerCount = () => {
  // 验证人数范围
  if (tempPlayerCount.value < 1 || tempPlayerCount.value > 12) {
    showToast({
      message: '人数上限应在1-12人之间',
      className: 'custom-toast'
    })
    return
  }
  
  form.maxPlayers = tempPlayerCount.value
  console.log('人数已选择:', form.maxPlayers)
  showPlayerPicker.value = false
}

// 取消人数选择
const cancelPlayerCount = () => {
  showPlayerPicker.value = false
}



// 提交表单
const onSubmit = async () => {
  try {
    console.log('=== 开始提交表单验证 ===')
    console.log('当前表单数据:', JSON.parse(JSON.stringify(form)))
    
    // 验证登录状态
    if (!userStore.isLoggedIn) {
      console.log('验证失败: 用户未登录')
      showToast({
      message: '请先登录',
      className: 'custom-toast'
    })
      router.push('/login')
      return
    }

    // 游客模式下不允许创建球局
    if (userStore.isGuestMode) {
      console.log('验证失败: 游客模式')
      showToast({
        message: '游客模式下无法创建球局，请注册账号后使用完整功能',
        className: 'custom-toast'
      })
      return
    }

    // 验证必填字段
    const requiredFields = [
      { field: form.title, name: 'title', message: '请输入球局标题' },
      { field: form.sport, name: 'sport', message: '请选择球种' },
      { field: form.year, name: 'year', message: '请输入年份' },
      { field: form.month, name: 'month', message: '请输入月份' },
      { field: form.day, name: 'day', message: '请输入日期' },
      { field: form.hour, name: 'hour', message: '请输入小时' },
      { field: form.minute, name: 'minute', message: '请输入分钟' },
      { field: form.location, name: 'location', message: '请输入地点' }
    ]

    console.log('=== 开始验证必填字段 ===')
    for (const { field, name, message } of requiredFields) {
      console.log(`验证字段 ${name}:`, `值: "${field}"`, `类型: ${typeof field}`, `长度: ${field ? field.length : 0}`)
      if (!field || field.toString().trim() === '') {
        console.log(`❌ 验证失败: 字段 ${name} 为空或无效`)
        showToast({
          message: message,
          className: 'custom-toast'
        })
        return
      }
      console.log(`✅ 字段 ${name} 验证通过`)
    }
    console.log('=== 所有必填字段验证通过 ===')

    // 验证人数上限
    if (!form.maxPlayers || form.maxPlayers < 1) {
      showToast({
        message: '请选择人数上限',
        className: 'custom-toast'
      })
      return
    }

    // 验证球种选择是否有效
    const validSports = ['匹克球', '网球', '羽毛球']
    if (!validSports.includes(form.sport)) {
      showToast({
        message: '请选择有效的球种',
        className: 'custom-toast'
      })
      return
    }

    // 验证标题长度
    if (form.title.length < 2 || form.title.length > 50) {
      showToast({
        message: '球局标题长度应在2-50个字符之间',
        className: 'custom-toast'
      })
      return
    }

    // 验证地点长度
    if (form.location.length < 2 || form.location.length > 100) {
      showToast({
        message: '地点长度应在2-100个字符之间',
        className: 'custom-toast'
      })
      return
    }

    // 验证时间格式和有效性
    if (!validateTime()) {
      showToast({
        message: timeValidationMessage.value || '时间格式无效',
        className: 'custom-toast'
      })
      return
    }

    // 验证人数范围
    if (form.maxPlayers < 1 || form.maxPlayers > 12) {
      showToast({
      message: '人数上限应在1-12人之间',
      className: 'custom-toast'
    })
      return
    }

    // 验证描述长度
    if (form.description && form.description.length > 200) {
      showToast({
        message: '描述长度不能超过200个字符',
        className: 'custom-toast'
      })
      return
    }

    // 将时间字段合并成完整的time字段
    const timeString = `${form.year}-${form.month.padStart(2, '0')}-${form.day.padStart(2, '0')}T${form.hour.padStart(2, '0')}:${form.minute.padStart(2, '0')}:00`
    console.log('生成的时间字符串:', timeString)
    
    // 创建完整的数据对象，确保字段名与API期望一致
    const matchData = {
      title: form.title,
      sport: form.sport,
      time: timeString,
      location: form.location,
      max_players: form.maxPlayers, // 注意：API期望的是max_players，不是maxPlayers
      description: form.description || '',
      creator_id: userStore.userInfo.id
    }
    
    console.log('提交的完整数据:', matchData)
    
    const result = await matchStore.createMatch(matchData)
    
    if (result.success) {
      showToast({
        message: '创建成功',
        type: 'success',
        className: 'custom-toast'
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
        type: 'fail',
        className: 'custom-toast'
      })
    }
  } catch (error) {
    console.error('创建球局异常:', error)
    showToast({
      message: '创建失败，请检查网络连接后重试',
      type: 'fail',
      className: 'custom-toast'
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
    return
  }
  
  // 初始化表单数据
  initFormData()
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

.time-picker-wrapper {
  padding: 16px;
}

.picker-row-horizontal {
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  gap: 4px;
  height: 200px;
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

/* 时间输入框样式 */
.time-input-group {
  padding: 16px;
}

.time-input-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.time-input-row .van-field {
  flex: 1;
  min-width: 0;
}

.time-input-row .van-field__label {
  width: auto;
  min-width: 20px;
  text-align: center;
  margin-right: 8px;
}

.time-unit {
  font-size: 14px;
  color: #666;
  font-weight: bold;
  min-width: 20px;
  text-align: center;
}

.time-validation {
  margin-top: 8px;
  text-align: center;
}

.validation-message {
  color: #ee0a24;
  font-size: 12px;
}

.validation-success {
  color: #07c160;
  font-size: 12px;
}

/* 调整输入框样式 */
.time-input-row .van-field__control {
  text-align: center;
}

.time-input-row .van-field__body {
  min-height: 40px;
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