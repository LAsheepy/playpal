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
              value-key="text"
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
            :value="timeDisplay"
            placeholder="请选择时间"
            @click="showTimePicker = true"
            :rules="[{ required: true, message: '请选择时间' }]"
          />
          
          <van-popup v-model:show="showTimePicker" position="bottom" :style="{ height: '60%' }" round>
            <div class="simple-time-picker">
              <div class="picker-header">
                <span class="picker-title">选择时间</span>
                <div>
                  <van-button size="small" plain @click="cancelTime" style="margin-right: 8px;">取消</van-button>
                  <van-button size="small" type="primary" @click="confirmSimpleTime">确定</van-button>
                </div>
              </div>
              
              <div class="time-display">
                <span class="selected-date">{{ simpleSelectedDate }}</span>
                <span class="selected-time">{{ simpleSelectedTime }}</span>
              </div>
              
              <div class="time-selector">
                <div class="date-selector">
                  <div class="selector-label">日期</div>
                  <div class="quick-dates">
                    <van-button 
                      size="small" 
                      :type="simpleQuickDate === 'today' ? 'primary' : 'default'"
                      @click="selectQuickDate('today')"
                    >今天</van-button>
                    <van-button 
                      size="small" 
                      :type="simpleQuickDate === 'tomorrow' ? 'primary' : 'default'"
                      @click="selectQuickDate('tomorrow')"
                    >明天</van-button>
                    <van-button 
                      size="small" 
                      :type="simpleQuickDate === 'weekend' ? 'primary' : 'default'"
                      @click="selectQuickDate('weekend')"
                    >周末</van-button>
                  </div>
                  <div class="date-slider">
                    <van-slider
                      v-model="simpleDateIndex"
                      :min="0"
                      :max="simpleDateOptions.length - 1"
                      :step="1"
                      bar-height="4px"
                      active-color="#1989fa"
                      @change="onDateSliderChange"
                    />
                    <div class="date-range">
                      <span>{{ simpleDateOptions[0]?.label || '' }}</span>
                      <span>{{ simpleDateOptions[simpleDateOptions.length - 1]?.label || '' }}</span>
                    </div>
                  </div>
                </div>
                
                <div class="time-slider">
                  <div class="selector-label">时间</div>
                  <div class="quick-times">
                    <van-button 
                      size="small" 
                      :type="simpleQuickTime === 'morning' ? 'primary' : 'default'"
                      @click="selectQuickTime('morning')"
                    >上午</van-button>
                    <van-button 
                      size="small" 
                      :type="simpleQuickTime === 'afternoon' ? 'primary' : 'default'"
                      @click="selectQuickTime('afternoon')"
                    >下午</van-button>
                    <van-button 
                      size="small" 
                      :type="simpleQuickTime === 'evening' ? 'primary' : 'default'"
                      @click="selectQuickTime('evening')"
                    >晚上</van-button>
                  </div>
                  <div class="time-range">
                    <van-slider
                      v-model="simpleTimeIndex"
                      :min="0"
                      :max="simpleTimeOptions.length - 1"
                      :step="1"
                      bar-height="4px"
                      active-color="#1989fa"
                      @change="onTimeSliderChange"
                    />
                    <div class="time-labels">
                      <span>08:00</span>
                      <span>22:00</span>
                    </div>
                  </div>
                </div>
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
  time: '',
  location: '',
  maxPlayers: 4,
  description: ''
})

// 计算属性：显示人数上限
const maxPlayersDisplay = computed(() => {
  return form.maxPlayers ? form.maxPlayers + '人' : '请选择人数上限'
})

// 选择器状态
const showSportPicker = ref(false)
const showTimePicker = ref(false)
const showPlayerPicker = ref(false)

// 临时数据
const tempPlayerCount = ref(4)

// 时间选择器数据
const selectedYear = ref('')
const selectedMonth = ref('')
const selectedDay = ref('')
const selectedHour = ref('')
const selectedMinute = ref('')

// 时间选项数据
const yearOptions = ref([])
const monthOptions = ref([])
const dayOptions = ref([])
const hourOptions = ref([])
const minuteOptions = ref([])

// 简化版时间选择器数据
const simpleDateIndex = ref(0)
const simpleTimeIndex = ref(0)
const simpleQuickDate = ref('')
const simpleQuickTime = ref('')
const simpleDateOptions = ref([])
const simpleTimeOptions = ref([])

// 生成时间选项
const generateTimeOptions = () => {
  // 生成年份选项（当前年份到5年后）
  const currentYear = new Date().getFullYear()
  yearOptions.value = []
  for (let i = 0; i <= 5; i++) {
    const year = currentYear + i
    yearOptions.value.push({ text: year + '年', value: year })
  }
  
  // 生成月份选项
  monthOptions.value = []
  for (let i = 1; i <= 12; i++) {
    monthOptions.value.push({ text: i + '月', value: i })
  }
  
  // 生成小时选项
  hourOptions.value = []
  for (let i = 0; i <= 23; i++) {
    hourOptions.value.push({ text: i.toString().padStart(2, '0') + '时', value: i })
  }
  
  // 生成分钟选项
  minuteOptions.value = []
  for (let i = 0; i <= 59; i += 5) {
    minuteOptions.value.push({ text: i.toString().padStart(2, '0') + '分', value: i })
  }
}

// 生成简化版时间选择器选项
const generateSimpleTimeOptions = () => {
  // 生成日期选项（今天到30天后）
  simpleDateOptions.value = []
  const today = new Date()
  
  for (let i = 0; i <= 30; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    
    const isToday = i === 0
    const isTomorrow = i === 1
    const isWeekend = [0, 6].includes(date.getDay()) // 0=周日, 6=周六
    
    let label = ''
    if (isToday) {
      label = '今天'
    } else if (isTomorrow) {
      label = '明天'
    } else if (isWeekend) {
      label = `周末 ${date.getMonth() + 1}月${date.getDate()}日`
    } else {
      label = `${date.getMonth() + 1}月${date.getDate()}日`
    }
    
    simpleDateOptions.value.push({
      label,
      date: new Date(date),
      isToday,
      isTomorrow,
      isWeekend
    })
  }
  
  // 生成时间选项（8:00-22:00，每30分钟一个间隔）
  simpleTimeOptions.value = []
  for (let hour = 8; hour <= 22; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      let period = ''
      
      if (hour < 12) {
        period = 'morning'
      } else if (hour < 18) {
        period = 'afternoon'
      } else {
        period = 'evening'
      }
      
      simpleTimeOptions.value.push({
        label: time,
        hour,
        minute,
        period
      })
    }
  }
}

// 生成日期选项
const generateDayOptions = (year, month) => {
  dayOptions.value = []
  const daysInMonth = new Date(year, month, 0).getDate()
  for (let i = 1; i <= daysInMonth; i++) {
    dayOptions.value.push({ text: i + '日', value: i })
  }
}

// 初始化表单数据
const initFormData = () => {
  // 设置默认人数上限
  form.maxPlayers = 4
  tempPlayerCount.value = 4
  
  // 生成时间选项
  generateTimeOptions()
  
  // 生成简化版时间选项
  generateSimpleTimeOptions()
  
  // 设置默认时间（当前时间+1小时）
  const defaultTime = new Date()
  defaultTime.setHours(defaultTime.getHours() + 1)
  
  // 设置默认时间选择器值
  selectedYear.value = defaultTime.getFullYear()
  selectedMonth.value = defaultTime.getMonth() + 1
  selectedDay.value = defaultTime.getDate()
  selectedHour.value = defaultTime.getHours()
  selectedMinute.value = Math.floor(defaultTime.getMinutes() / 5) * 5
  
  // 设置简化版时间选择器默认值
  const defaultDateIndex = simpleDateOptions.value.findIndex(option => {
    const optionDate = new Date(option.date)
    return optionDate.toDateString() === defaultTime.toDateString()
  })
  
  if (defaultDateIndex !== -1) {
    simpleDateIndex.value = defaultDateIndex
  }
  
  // 找到最接近的时间选项
  const defaultHour = defaultTime.getHours()
  const defaultMinute = Math.round(defaultTime.getMinutes() / 30) * 30
  const defaultTimeIndex = simpleTimeOptions.value.findIndex(option => 
    option.hour === defaultHour && option.minute === defaultMinute
  )
  
  if (defaultTimeIndex !== -1) {
    simpleTimeIndex.value = defaultTimeIndex
  }
  
  // 生成日期选项
  generateDayOptions(selectedYear.value, selectedMonth.value)
  
  // 设置表单时间
  updateFormTime()
}

// 更新表单时间
const updateFormTime = () => {
  if (selectedYear.value && selectedMonth.value && selectedDay.value && selectedHour.value !== undefined && selectedMinute.value !== undefined) {
    const date = new Date(selectedYear.value, selectedMonth.value - 1, selectedDay.value, selectedHour.value, selectedMinute.value)
    form.time = date.toISOString()
    console.log('时间已更新:', form.time)
  }
}

// 年份变化处理
const onYearChange = (value) => {
  selectedYear.value = value.selectedValues ? value.selectedValues[0] : value.value
  if (selectedMonth.value) {
    generateDayOptions(selectedYear.value, selectedMonth.value)
    updateFormTime()
  }
}

// 月份变化处理
const onMonthChange = (value) => {
  selectedMonth.value = value.selectedValues ? value.selectedValues[0] : value.value
  if (selectedYear.value) {
    generateDayOptions(selectedYear.value, selectedMonth.value)
    updateFormTime()
  }
}

// 日期变化处理
const onDayChange = (value) => {
  selectedDay.value = value.selectedValues ? value.selectedValues[0] : value.value
  updateFormTime()
}

// 小时变化处理
const onHourChange = (value) => {
  selectedHour.value = value.selectedValues ? value.selectedValues[0] : value.value
  updateFormTime()
}

// 分钟变化处理
const onMinuteChange = (value) => {
  selectedMinute.value = value.selectedValues ? value.selectedValues[0] : value.value
  updateFormTime()
}

// 简化版时间选择器计算属性
const simpleSelectedDate = computed(() => {
  if (simpleDateOptions.value.length === 0) return ''
  const option = simpleDateOptions.value[simpleDateIndex.value]
  return option ? option.label : ''
})

const simpleSelectedTime = computed(() => {
  if (simpleTimeOptions.value.length === 0) return ''
  const option = simpleTimeOptions.value[simpleTimeIndex.value]
  return option ? option.label : ''
})

// 简化版时间选择器方法
const onDateSliderChange = (value) => {
  simpleDateIndex.value = value
  simpleQuickDate.value = '' // 清除快速选择状态
  updateSimpleFormTime()
}

const onTimeSliderChange = (value) => {
  simpleTimeIndex.value = value
  simpleQuickTime.value = '' // 清除快速选择状态
  updateSimpleFormTime()
}

const selectQuickDate = (type) => {
  simpleQuickDate.value = type
  
  switch (type) {
    case 'today':
      simpleDateIndex.value = 0
      break
    case 'tomorrow':
      simpleDateIndex.value = 1
      break
    case 'weekend':
      // 找到下一个周末
      const today = new Date()
      let weekendIndex = simpleDateOptions.value.findIndex(option => option.isWeekend && option.date > today)
      if (weekendIndex === -1) weekendIndex = 0
      simpleDateIndex.value = weekendIndex
      break
  }
  
  updateSimpleFormTime()
}

const selectQuickTime = (type) => {
  simpleQuickTime.value = type
  
  switch (type) {
    case 'morning':
      // 找到第一个上午时间（8:00-11:30）
      const morningIndex = simpleTimeOptions.value.findIndex(option => option.hour < 12)
      if (morningIndex !== -1) simpleTimeIndex.value = morningIndex
      break
    case 'afternoon':
      // 找到第一个下午时间（12:00-17:30）
      const afternoonIndex = simpleTimeOptions.value.findIndex(option => option.hour >= 12 && option.hour < 18)
      if (afternoonIndex !== -1) simpleTimeIndex.value = afternoonIndex
      break
    case 'evening':
      // 找到第一个晚上时间（18:00-22:00）
      const eveningIndex = simpleTimeOptions.value.findIndex(option => option.hour >= 18)
      if (eveningIndex !== -1) simpleTimeIndex.value = eveningIndex
      break
  }
  
  updateSimpleFormTime()
}

const updateSimpleFormTime = () => {
  if (simpleDateOptions.value.length === 0 || simpleTimeOptions.value.length === 0) return
  
  const dateOption = simpleDateOptions.value[simpleDateIndex.value]
  const timeOption = simpleTimeOptions.value[simpleTimeIndex.value]
  
  if (!dateOption || !timeOption) return
  
  const selectedDate = new Date(dateOption.date)
  selectedDate.setHours(timeOption.hour, timeOption.minute, 0, 0)
  
  // 验证时间是否在未来
  const currentTime = new Date()
  if (selectedDate <= currentTime) {
    // 如果选择的时间在过去，自动调整到当前时间之后
    const adjustedTime = new Date(currentTime)
    adjustedTime.setHours(adjustedTime.getHours() + 1)
    
    // 找到最接近的可用时间
    const adjustedDateIndex = simpleDateOptions.value.findIndex(option => 
      new Date(option.date).toDateString() === adjustedTime.toDateString()
    )
    
    if (adjustedDateIndex !== -1) {
      simpleDateIndex.value = adjustedDateIndex
    }
    
    const adjustedHour = adjustedTime.getHours()
    const adjustedMinute = Math.round(adjustedTime.getMinutes() / 30) * 30
    const adjustedTimeIndex = simpleTimeOptions.value.findIndex(option => 
      option.hour === adjustedHour && option.minute === adjustedMinute
    )
    
    if (adjustedTimeIndex !== -1) {
      simpleTimeIndex.value = adjustedTimeIndex
    }
    
    // 重新获取调整后的选项
    const newDateOption = simpleDateOptions.value[simpleDateIndex.value]
    const newTimeOption = simpleTimeOptions.value[simpleTimeIndex.value]
    
    if (newDateOption && newTimeOption) {
      const finalDate = new Date(newDateOption.date)
      finalDate.setHours(newTimeOption.hour, newTimeOption.minute, 0, 0)
      form.time = finalDate.toISOString()
    }
  } else {
    form.time = selectedDate.toISOString()
  }
}

const cancelTime = () => {
  showTimePicker.value = false
}

const confirmSimpleTime = () => {
  // 验证时间是否完整选择
  if (simpleDateOptions.value.length === 0 || simpleTimeOptions.value.length === 0) {
    showToast('请完整选择时间')
    return
  }
  
  const dateOption = simpleDateOptions.value[simpleDateIndex.value]
  const timeOption = simpleTimeOptions.value[simpleTimeIndex.value]
  
  if (!dateOption || !timeOption) {
    showToast('时间选择无效，请重新选择')
    return
  }
  
  const selectedTime = new Date(dateOption.date)
  selectedTime.setHours(timeOption.hour, timeOption.minute, 0, 0)
  const currentTime = new Date()
  
  if (selectedTime <= currentTime) {
    showToast('请选择未来的时间')
    return
  }
  
  form.time = selectedTime.toISOString()
  console.log('简化版时间选择器已选择:', form.time)
  showTimePicker.value = false
}

// 选项数据
const sportOptions = [
  { text: '匹克球', value: '匹克球' },
  { text: '网球', value: '网球' },
  { text: '羽毛球', value: '羽毛球' }
]



// 球种确认
const onSportConfirm = (value) => {
  // Vant Picker 返回的是Proxy对象，需要提取selectedValues数组的第一个值
  let selectedValue = ''
  let displayText = ''
  
  // 处理Proxy对象，提取实际的值
  if (value && value.selectedValues && value.selectedValues.length > 0) {
    selectedValue = value.selectedValues[0]
    displayText = value.selectedOptions && value.selectedOptions[0] ? value.selectedOptions[0].text : selectedValue
  } else if (value && value.value) {
    // 备用方案：直接提取value属性
    selectedValue = value.value
    displayText = value.text || selectedValue
  } else if (typeof value === 'string') {
    // 如果是字符串，直接使用
    selectedValue = value
    displayText = value
  }
  
  form.sport = selectedValue
  console.log('球种已选择:', selectedValue, '显示文本:', displayText)
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

// 确认时间选择（兼容旧版）
const confirmTime = () => {
  // 使用简化版时间选择器
  confirmSimpleTime()
}

// 确认人数选择
const confirmPlayerCount = () => {
  // 验证人数范围
  if (tempPlayerCount.value < 1 || tempPlayerCount.value > 12) {
    showToast('人数上限应在1-12人之间')
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

// 计算属性：显示时间
const timeDisplay = computed(() => {
  if (!form.time) return '请选择时间'
  
  try {
    const date = new Date(form.time)
    if (isNaN(date.getTime())) return '时间格式错误'
    
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
})



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

    // 验证球种选择是否有效
    const validSports = ['匹克球', '网球', '羽毛球']
    if (!validSports.includes(form.sport)) {
      showToast('请选择有效的球种')
      return
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

/* 简化版时间选择器样式 */
.simple-time-picker {
  background: white;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #ebedf0;
  flex-shrink: 0;
}

.picker-title {
  font-size: 16px;
  font-weight: bold;
}

.time-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 16px;
  background: linear-gradient(135deg, #f0f7ff 0%, #e6f3ff 100%);
  border-bottom: 1px solid #ebedf0;
}

.selected-date {
  font-size: 20px;
  font-weight: bold;
  color: #1989fa;
  margin-bottom: 4px;
}

.selected-time {
  font-size: 16px;
  color: #666;
}

.time-selector {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 24px;
  overflow-y: auto;
}

.date-selector,
.time-slider {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.selector-label {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.quick-dates,
.quick-times {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.date-slider,
.time-range {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.date-range,
.time-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
}

/* 滑块样式优化 */
:deep(.van-slider__button) {
  width: 20px;
  height: 20px;
  background: #1989fa;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(25, 137, 250, 0.3);
}

:deep(.van-slider__bar) {
  background: #1989fa;
}

:deep(.van-slider__track) {
  background: #ebedf0;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .time-display {
    padding: 16px;
  }
  
  .selected-date {
    font-size: 18px;
  }
  
  .selected-time {
    font-size: 14px;
  }
  
  .time-selector {
    padding: 12px;
    gap: 20px;
  }
}

/* 时间选择器样式 */
.time-picker-wrapper {
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 12px;
}

.picker-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.picker-label {
  width: 40px;
  font-size: 14px;
  font-weight: bold;
  color: #333;
  text-align: center;
}

:deep(.van-picker) {
  flex: 1;
}

:deep(.van-picker-column) {
  font-size: 14px;
}

:deep(.van-picker__mask) {
  background-image: 
    linear-gradient(180deg, hsla(0, 0%, 100%, 0.9), hsla(0, 0%, 100%, 0.4)),
    linear-gradient(0deg, hsla(0, 0%, 100%, 0.9), hsla(0, 0%, 100%, 0.4));
}

:deep(.van-picker-column__item) {
  color: #333;
}

:deep(.van-picker-column__item--selected) {
  color: #1989fa;
  font-weight: bold;
}
</style>