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
            :value="form.gender"
            placeholder="请选择性别"
            @click="showGenderPicker = true"
          />
          
          <van-popup v-model:show="showGenderPicker" position="bottom">
            <van-picker
              :columns="genderOptions"
              @confirm="onGenderConfirm"
              @cancel="showGenderPicker = false"
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
                :value="form.pickleballLevel || '请选择水平'"
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
                :value="form.tennisLevel || '请选择水平'"
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
                :value="form.badmintonLevel || '请选择水平'"
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
      />
    </van-popup>
    
    <van-popup v-model:show="showTennisPicker" position="bottom" round>
      <van-picker
        :columns="tennisLevelOptions"
        @confirm="(value) => onLevelConfirm('tennis', value)"
        @cancel="showTennisPicker = false"
      />
    </van-popup>
    
    <van-popup v-model:show="showBadmintonPicker" position="bottom" round>
      <van-picker
        :columns="badmintonLevelOptions"
        @confirm="(value) => onLevelConfirm('badminton', value)"
        @cancel="showBadmintonPicker = false"
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
const genderOptions = ['男', '女']
const pickleballLevelOptions = ['2.0', '2.5', '3.0', '3.5', '4.0', '4.5', '5.0+']
const tennisLevelOptions = ['2.0', '2.5', '3.0', '3.5', '4.0', '4.5', '5.0+']
const badmintonLevelOptions = ['初级', '进阶', '专业']

// 选择器确认事件
const onGenderConfirm = (value) => {
  form.gender = value
  showGenderPicker.value = false
}

const onLevelConfirm = (sport, value) => {
  if (sport === 'pickleball') {
    form.pickleballLevel = value
    showPickleballPicker.value = false
  } else if (sport === 'tennis') {
    form.tennisLevel = value
    showTennisPicker.value = false
  } else if (sport === 'badminton') {
    form.badmintonLevel = value
    showBadmintonPicker.value = false
  }
}

// 保存资料
const handleSave = async () => {
  try {
    await formRef.value.validate()
    
    // 验证年龄范围
    if (form.age && (form.age < 1 || form.age > 100)) {
      showToast('请输入有效的年龄（1-100）')
      return
    }
    
    emit('save', form)
  } catch (error) {
    showToast('请完善资料信息')
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
</style>