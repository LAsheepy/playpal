<template>
  <div class="edit-profile-container">
    <van-nav-bar
      title="编辑资料"
      left-text="取消"
      right-text="保存"
      @click-left="$emit('cancel')"
      @click-right="handleSave"
    />

    <div class="form-content">
      <van-form ref="formRef">
        <!-- 基本信息 -->
        <van-cell-group title="基本信息">
          <van-field
            v-model="form.nickname"
            name="nickname"
            label="昵称"
            placeholder="请输入昵称"
            :rules="[{ required: true, message: '请输入昵称' }]"
          />
          
          <van-field
            readonly
            clickable
            name="gender"
            label="性别"
            v-model="form.gender"
            placeholder="请选择性别"
            @click="showGenderPicker = true"
          />
          
          <van-popup v-model:show="showGenderPicker" position="bottom">
            <van-picker
              :columns="genderOptions"
              @confirm="onGenderConfirm"
              @cancel="showGenderPicker = false"
              value-key="text"
            />
          </van-popup>
          
          <van-field
            v-model="form.age"
            name="age"
            label="年龄"
            placeholder="请输入年龄"
            type="number"
          />
        </van-cell-group>

        <!-- 运动水平设置 -->
        <van-cell-group title="运动水平设置">
          <div class="sport-level-section">
            <!-- 匹克球水平 -->
            <div class="sport-level-row">
              <span class="sport-label">匹克球</span>
              <van-field
                readonly
                clickable
                v-model="form.pickleballLevel"
                placeholder="请选择水平"
                @click="showPickleballPicker = true"
              />
            </div>
            
            <!-- 网球水平 -->
            <div class="sport-level-row">
              <span class="sport-label">网球</span>
              <van-field
                readonly
                clickable
                v-model="form.tennisLevel"
                placeholder="请选择水平"
                @click="showTennisPicker = true"
              />
            </div>
            
            <!-- 羽毛球水平 -->
            <div class="sport-level-row">
              <span class="sport-label">羽毛球</span>
              <van-field
                readonly
                clickable
                v-model="form.badmintonLevel"
                placeholder="请选择水平"
                @click="showBadmintonPicker = true"
              />
            </div>
          </div>
        </van-cell-group>

        <!-- 个人简介 -->
        <van-cell-group title="个人简介">
          <van-field
            v-model="form.bio"
            rows="3"
            autosize
            type="textarea"
            maxlength="100"
            placeholder="介绍一下自己吧（可选）"
            show-word-limit
          />
        </van-cell-group>
      </van-form>
    </div>

    <!-- 水平选择器 -->
    <van-popup v-model:show="showPickleballPicker" position="bottom" round>
      <van-picker
        :columns="pickleballLevelOptions"
        @confirm="(value) => onLevelConfirm('pickleball', value)"
        @cancel="showPickleballPicker = false"
        value-key="text"
      />
    </van-popup>
    
    <van-popup v-model:show="showTennisPicker" position="bottom" round>
      <van-picker
        :columns="tennisLevelOptions"
        @confirm="(value) => onLevelConfirm('tennis', value)"
        @cancel="showTennisPicker = false"
        value-key="text"
      />
    </van-popup>
    
    <van-popup v-model:show="showBadmintonPicker" position="bottom" round>
      <van-picker
        :columns="badmintonLevelOptions"
        @confirm="(value) => onLevelConfirm('badminton', value)"
        @cancel="showBadmintonPicker = false"
        value-key="text"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import {
  showToast,
  NavBar as VanNavBar,
  Form as VanForm,
  Field as VanField,
  CellGroup as VanCellGroup,
  Popup as VanPopup,
  Picker as VanPicker,
  Button as VanButton
} from 'vant'

const emit = defineEmits(['save', 'cancel'])

const props = defineProps({
  userInfo: {
    type: Object,
    required: true
  }
})

const formRef = ref()

// 表单数据
const form = reactive({
  nickname: '',
  gender: '',
  age: null,
  pickleballLevel: '',
  tennisLevel: '',
  badmintonLevel: '',
  bio: ''
})

// 选择器状态
const showGenderPicker = ref(false)
const showPickleballPicker = ref(false)
const showTennisPicker = ref(false)
const showBadmintonPicker = ref(false)

// 选项数据
const genderOptions = [
  { text: '男', value: '男' },
  { text: '女', value: '女' }
]
const pickleballLevelOptions = [
  { text: '2.0', value: '2.0' },
  { text: '2.5', value: '2.5' },
  { text: '3.0', value: '3.0' },
  { text: '3.5', value: '3.5' },
  { text: '4.0', value: '4.0' },
  { text: '4.5', value: '4.5' },
  { text: '5.0+', value: '5.0+' }
]
const tennisLevelOptions = [
  { text: '2.0', value: '2.0' },
  { text: '2.5', value: '2.5' },
  { text: '3.0', value: '3.0' },
  { text: '3.5', value: '3.5' },
  { text: '4.0', value: '4.0' },
  { text: '4.5', value: '4.5' },
  { text: '5.0+', value: '5.0+' }
]
const badmintonLevelOptions = [
  { text: '初级', value: '初级' },
  { text: '进阶', value: '进阶' },
  { text: '专业', value: '专业' }
]

// 选择器确认事件
const onGenderConfirm = (value) => {
  // 处理Proxy对象，提取实际的值
  let selectedValue = ''
  
  if (value && value.selectedValues && value.selectedValues.length > 0) {
    selectedValue = value.selectedValues[0]
  } else if (value && value.value) {
    selectedValue = value.value
  } else if (typeof value === 'string') {
    selectedValue = value
  }
  
  form.gender = selectedValue
  console.log('性别已选择:', selectedValue)
  showGenderPicker.value = false
}

const onLevelConfirm = (sport, value) => {
  // 处理Proxy对象，提取实际的值
  let selectedValue = ''
  
  if (value && value.selectedValues && value.selectedValues.length > 0) {
    selectedValue = value.selectedValues[0]
  } else if (value && value.value) {
    selectedValue = value.value
  } else if (typeof value === 'string') {
    selectedValue = value
  }
  
  if (sport === 'pickleball') {
    form.pickleballLevel = selectedValue
    console.log('匹克球水平已选择:', selectedValue)
    showPickleballPicker.value = false
  } else if (sport === 'tennis') {
    form.tennisLevel = selectedValue
    console.log('网球水平已选择:', selectedValue)
    showTennisPicker.value = false
  } else if (sport === 'badminton') {
    form.badmintonLevel = selectedValue
    console.log('羽毛球水平已选择:', selectedValue)
    showBadmintonPicker.value = false
  }
}

// 保存资料
const handleSave = async () => {
  try {
    // 验证表单
    await formRef.value.validate()
    
    // 验证昵称
    if (!form.nickname || form.nickname.trim().length === 0) {
      showToast({
        message: '请输入昵称',
        className: 'custom-toast'
      })
      return
    }
    
    if (form.nickname.length < 2 || form.nickname.length > 20) {
      showToast({
        message: '昵称长度应在2-20个字符之间',
        className: 'custom-toast'
      })
      return
    }
    
    // 验证昵称格式（只允许中文、英文、数字和下划线）
    const nicknameRegex = /^[\u4e00-\u9fa5a-zA-Z0-9_]+$/
    if (!nicknameRegex.test(form.nickname)) {
      showToast({
        message: '昵称只能包含中文、英文、数字和下划线',
        className: 'custom-toast'
      })
      return
    }
    
    // 验证年龄范围
    if (form.age) {
      const age = parseInt(form.age)
      if (isNaN(age) || age < 1 || age > 100) {
        showToast({
        message: '请输入有效的年龄（1-100）',
        className: 'custom-toast'
      })
        return
      }
    }
    
    // 验证性别
    if (form.gender && !['男', '女'].includes(form.gender)) {
      showToast({
        message: '请选择有效的性别',
        className: 'custom-toast'
      })
      return
    }
    
    // 验证运动水平
    const validLevels = {
      pickleball: ['2.0', '2.5', '3.0', '3.5', '4.0', '4.5', '5.0+'],
      tennis: ['2.0', '2.5', '3.0', '3.5', '4.0', '4.5', '5.0+'],
      badminton: ['初级', '进阶', '专业']
    }
    
    if (form.pickleballLevel && !validLevels.pickleball.includes(form.pickleballLevel)) {
      showToast({
        message: '请选择有效的匹克球水平',
        className: 'custom-toast'
      })
      return
    }
    
    if (form.tennisLevel && !validLevels.tennis.includes(form.tennisLevel)) {
      showToast({
        message: '请选择有效的网球水平',
        className: 'custom-toast'
      })
      return
    }
    
    if (form.badmintonLevel && !validLevels.badminton.includes(form.badmintonLevel)) {
      showToast({
        message: '请选择有效的羽毛球水平',
        className: 'custom-toast'
      })
      return
    }
    
    // 验证个人简介长度
    if (form.bio && form.bio.length > 100) {
      showToast({
        message: '个人简介长度不能超过100个字符',
        className: 'custom-toast'
      })
      return
    }
    
    // 发送保存事件
    emit('save', form)
  } catch (error) {
    console.error('保存资料验证失败:', error)
    showToast({
      message: '请完善资料信息',
      className: 'custom-toast'
    })
  }
}

// 初始化表单数据
const initForm = () => {
  Object.assign(form, props.userInfo)
}

// 监听props变化
initForm()
</script>

<style scoped>
.edit-profile-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.form-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
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

.sport-level-section {
  padding: 0 16px;
}

.sport-level-row {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.sport-label {
  width: 80px;
  text-align: right;
  margin-right: 12px;
  font-size: 14px;
  color: #323233;
}

.sport-level-row .van-field {
  flex: 1;
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