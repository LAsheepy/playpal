<template>
  <div class="help-feedback-container">
    <!-- 返回按钮 -->
    <van-nav-bar
      title="帮助与反馈"
      left-text="返回"
      left-arrow
      @click-left="goBack"
    />
    
    <!-- 页面内容 -->
    <div class="help-feedback-content">
      <!-- 快速帮助 -->
      <div class="quick-help-section">
        <h2>常见问题</h2>
        <van-collapse v-model="activeHelp" accordion>
          <van-collapse-item title="如何创建球局？" name="1">
            <p>在首页点击"创建球局"按钮，填写球局信息后提交即可创建新的球局。</p>
          </van-collapse-item>
          <van-collapse-item title="如何加入球局？" name="2">
            <p>在首页球局列表中点击您感兴趣的球局，进入详情页后点击"加入球局"按钮。</p>
          </van-collapse-item>
          <van-collapse-item title="如何记录对战结果？" name="3">
            <p>在球局详情页，点击"记录对战"按钮，填写比分和参与者信息即可记录。</p>
          </van-collapse-item>
          <van-collapse-item title="如何修改个人资料？" name="4">
            <p>在"我的"页面点击"编辑资料"，即可修改昵称、头像、运动水平等信息。</p>
          </van-collapse-item>
          <van-collapse-item title="忘记密码怎么办？" name="5">
            <p>目前暂不支持密码找回功能，请联系管理员重置密码。</p>
          </van-collapse-item>
        </van-collapse>
      </div>
      
      <!-- 反馈表单 -->
      <div class="feedback-section">
        <h2>提交反馈</h2>
        <div class="feedback-card">
          <van-form @submit="onSubmit">
            <!-- 反馈类型 -->
            <van-field
              v-model="feedbackType"
              is-link
              readonly
              label="反馈类型"
              placeholder="请选择反馈类型"
              @click="showTypePicker = true"
            />
            
            <!-- 反馈内容 -->
            <van-field
              v-model="feedbackContent"
              rows="4"
              autosize
              type="textarea"
              label="反馈内容"
              placeholder="请详细描述您遇到的问题或建议"
              :rules="[{ required: true, message: '请填写反馈内容' }]"
            />
            
            <!-- 联系方式 -->
            <van-field
              v-model="contactInfo"
              label="联系方式"
              placeholder="邮箱或手机号（选填，便于我们联系您）"
            />
            
            <!-- 提交按钮 -->
            <div style="margin: 16px;">
              <van-button 
                round 
                block 
                type="primary" 
                native-type="submit"
                :loading="isSubmitting"
              >
                提交反馈
              </van-button>
            </div>
          </van-form>
        </div>
      </div>
      
      <!-- 我的反馈记录 -->
      <div v-if="userFeedbacks.length > 0" class="feedback-history-section">
        <h2>我的反馈记录</h2>
        <div class="feedback-list">
          <div 
            v-for="feedback in userFeedbacks" 
            :key="feedback.id"
            class="feedback-item"
            :class="getStatusClass(feedback.status)"
          >
            <div class="feedback-header">
              <span class="feedback-type">{{ getTypeText(feedback.type) }}</span>
              <span class="feedback-status">{{ getStatusText(feedback.status) }}</span>
            </div>
            <div class="feedback-content">{{ feedback.content }}</div>
            <div class="feedback-footer">
              <span class="feedback-time">{{ formatTime(feedback.created_at) }}</span>
              <span v-if="feedback.contact_info" class="feedback-contact">
                联系方式：{{ feedback.contact_info }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 反馈类型选择器 -->
    <van-popup v-model:show="showTypePicker" position="bottom">
      <van-picker
        :columns="typeOptions"
        @confirm="onTypeConfirm"
        @cancel="showTypePicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { feedbackApi } from '../utils/supabase'
import { 
  NavBar as VanNavBar, 
  Collapse as VanCollapse, 
  CollapseItem as VanCollapseItem,
  Form as VanForm,
  Field as VanField,
  Button as VanButton,
  Picker as VanPicker,
  Popup as VanPopup,
  showToast,
  showConfirmDialog
} from 'vant'

const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const activeHelp = ref([])
const showTypePicker = ref(false)
const isSubmitting = ref(false)

// 表单数据
const feedbackType = ref('')
const feedbackContent = ref('')
const contactInfo = ref('')

// 反馈记录
const userFeedbacks = ref([])

// 反馈类型选项
const typeOptions = [
  { text: '功能建议', value: 'suggestion' },
  { text: '问题反馈', value: 'issue' },
  { text: '使用咨询', value: 'consultation' },
  { text: '投诉建议', value: 'complaint' },
  { text: '其他', value: 'other' }
]

// 类型选择确认
const onTypeConfirm = (value) => {
  // 修复picker值获取问题
  if (typeof value === 'object' && value.text) {
    feedbackType.value = value.text
  } else if (typeof value === 'string') {
    // 如果直接是字符串，找到对应的选项
    const option = typeOptions.find(opt => opt.text === value)
    feedbackType.value = option ? option.text : value
  }
  showTypePicker.value = false
}

// 获取类型文本
const getTypeText = (type) => {
  const option = typeOptions.find(opt => opt.value === type)
  return option ? option.text : '其他'
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    'pending': '待处理',
    'resolved': '已解决'
  }
  return statusMap[status] || status
}

// 获取状态样式类
const getStatusClass = (status) => {
  return {
    'pending': 'status-pending',
    'resolved': 'status-resolved'
  }[status] || ''
}

// 格式化时间
const formatTime = (timeString) => {
  if (!timeString) return ''
  const date = new Date(timeString)
  return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

// 提交反馈
const onSubmit = async () => {
  if (!feedbackContent.value.trim()) {
    showToast('请填写反馈内容')
    return
  }
  
  if (!userStore.isLoggedIn) {
    showToast('请先登录后再提交反馈')
    router.push('/login')
    return
  }
  
  isSubmitting.value = true
  
  try {
    const feedbackData = {
      user_id: userStore.userInfo.id,
      content: feedbackContent.value.trim(),
      contact_info: contactInfo.value.trim(),
      type: typeOptions.find(opt => opt.text === feedbackType.value)?.value || 'other'
    }
    
    const { data, error } = await feedbackApi.submitFeedback(feedbackData)
    
    if (error) {
      showToast(`提交失败：${error}`)
      return
    }
    
    showToast('反馈提交成功！感谢您的宝贵意见')
    
    // 清空表单
    feedbackType.value = ''
    feedbackContent.value = ''
    contactInfo.value = ''
    
    // 重新加载反馈记录
    await loadUserFeedbacks()
    
  } catch (error) {
    console.error('提交反馈异常:', error)
    showToast('提交失败，请稍后重试')
  } finally {
    isSubmitting.value = false
  }
}

// 加载用户反馈记录
const loadUserFeedbacks = async () => {
  if (!userStore.isLoggedIn) return
  
  try {
    const { data, error } = await feedbackApi.getUserFeedbacks(userStore.userInfo.id)
    
    if (error) {
      console.error('加载反馈记录失败:', error)
      return
    }
    
    userFeedbacks.value = data || []
  } catch (error) {
    console.error('加载反馈记录异常:', error)
  }
}

const goBack = () => {
  router.back()
}

// 页面加载时获取反馈记录
onMounted(async () => {
  if (userStore.isLoggedIn) {
    await loadUserFeedbacks()
  }
})
</script>

<style scoped>
.help-feedback-container {
  height: 100vh;
  background-color: #f8f9fa;
  overflow-y: auto;
}

.help-feedback-content {
  padding: 20px;
}

/* 快速帮助样式 */
.quick-help-section {
  margin-bottom: 24px;
}

.quick-help-section h2 {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 16px 0;
}

:deep(.van-collapse-item__content) {
  background-color: #f8f9fa;
  padding: 16px;
}

:deep(.van-collapse-item__content p) {
  margin: 0;
  line-height: 1.6;
  color: #555;
}

/* 反馈表单样式 */
.feedback-section {
  margin-bottom: 24px;
}

.feedback-section h2 {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 16px 0;
}

.feedback-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* 反馈记录样式 */
.feedback-history-section {
  margin-bottom: 24px;
}

.feedback-history-section h2 {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 16px 0;
}

.feedback-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feedback-item {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border-left: 4px solid #e0e0e0;
}

.feedback-item.status-pending {
  border-left-color: #f39c12;
}

.feedback-item.status-resolved {
  border-left-color: #27ae60;
}

.feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.feedback-type {
  font-size: 14px;
  font-weight: 500;
  color: #3498db;
}

.feedback-status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  background: #f0f0f0;
  color: #7f8c8d;
}

.feedback-item.status-pending .feedback-status {
  background: #fff3cd;
  color: #856404;
}

.feedback-item.status-resolved .feedback-status {
  background: #d4edda;
  color: #155724;
}

.feedback-content {
  font-size: 14px;
  line-height: 1.5;
  color: #555;
  margin-bottom: 8px;
  word-break: break-word;
}

.feedback-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #999;
}

.feedback-contact {
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .help-feedback-content {
    padding: 16px;
  }
  
  .feedback-card {
    padding: 12px;
  }
  
  .feedback-item {
    padding: 12px;
  }
  
  .feedback-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .feedback-contact {
    max-width: 100%;
  }
}
</style>