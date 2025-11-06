<template>
  <div class="profile-container">
    <!-- 用户信息头部 -->
    <div class="profile-header">
      <div class="user-avatar">
        <van-image
          round
          width="80"
          height="80"
          :src="userStore.userInfo.avatar || '/default-avatar.jpg'"
        />
        <van-uploader 
          :after-read="onAvatarUpload"
          :max-size="1024 * 1024"
          @oversize="onOversize"
        >
          <van-icon name="photograph" class="upload-icon" />
        </van-uploader>
      </div>
      
      <div class="user-info">
        <h2 class="user-name">{{ userStore.userInfo.nickname }}</h2>
        <p class="user-email">{{ userStore.userInfo.email }}</p>
        
        <!-- 个人简介 - 单独一行 -->
        <p v-if="userStore.userInfo.bio" class="user-bio">{{ userStore.userInfo.bio }}</p>
      </div>
      
      <!-- 运动水平信息 - 移到右侧 -->
      <div class="sport-level-info">
        <div class="sport-level-tags">
          <div v-if="userStore.userInfo.pickleballLevel" class="sport-level-item">
            <van-tag 
              :color="getSportColor('匹克球')"
              text-color="white"
              size="medium"
            >
              匹克球
            </van-tag>
            <van-tag 
              :color="getLevelColor(getLevelCategory(userStore.userInfo.pickleballLevel))"
              text-color="white"
              size="medium"
            >
              {{ userStore.userInfo.pickleballLevel }}
            </van-tag>
          </div>
          
          <div v-if="userStore.userInfo.tennisLevel" class="sport-level-item">
            <van-tag 
              :color="getSportColor('网球')"
              text-color="white"
              size="medium"
            >
              网球
            </van-tag>
            <van-tag 
              :color="getLevelColor(getLevelCategory(userStore.userInfo.tennisLevel))"
              text-color="white"
              size="medium"
            >
              {{ userStore.userInfo.tennisLevel }}
            </van-tag>
          </div>
          
          <div v-if="userStore.userInfo.badmintonLevel" class="sport-level-item">
            <van-tag 
              :color="getSportColor('羽毛球')"
              text-color="white"
              size="medium"
            >
              羽毛球
            </van-tag>
            <van-tag 
              :color="getLevelColor(userStore.userInfo.badmintonLevel)"
              text-color="white"
              size="medium"
            >
              {{ userStore.userInfo.badmintonLevel }}
            </van-tag>
          </div>
        </div>
      </div>
    </div>

    <!-- 功能菜单 -->
    <div class="menu-section">
      <van-cell-group>
        <van-cell 
          title="编辑资料" 
          icon="edit" 
          is-link
          @click="goToEditProfile"
        />

        <van-cell 
          title="历史记录" 
          icon="records" 
          is-link
          @click="goToHistory"
        />
        <van-cell 
          title="关于我们" 
          icon="info-o" 
          is-link
          @click="goToAbout"
        />
        <van-cell 
          title="帮助与反馈" 
          icon="question-o" 
          is-link
          @click="goToHelpFeedback"
        />
      </van-cell-group>
    </div>

    <!-- 退出登录 -->
    <div class="logout-section">
      <van-button 
        round 
        block 
        type="default" 
        @click="handleLogout"
        class="logout-btn"
      >
        退出登录
      </van-button>
    </div>

    <!-- 编辑资料弹窗 -->
    <van-popup 
      v-model:show="showEditPopup" 
      position="bottom" 
      round
      :style="{ height: '80%' }"
    >
      <EditProfile 
        :user-info="userStore.userInfo"
        @save="handleSaveProfile"
        @cancel="showEditPopup = false"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useMatchStore } from '../stores/match'
import {
  showToast,
  showConfirmDialog,
  Image as VanImage,
  Uploader as VanUploader,
  Icon as VanIcon,
  Tag as VanTag,
  Cell as VanCell,
  CellGroup as VanCellGroup,
  Button as VanButton
} from 'vant'
import EditProfile from '../components/EditProfile.vue'
import { getSportColor, getLevelColor, getLevelTextColor } from '../utils/colors'

const router = useRouter()
const userStore = useUserStore()
const matchStore = useMatchStore()

const showEditPopup = ref(false)

// 计算属性 - 已移除数字显示

// 头像上传
const onAvatarUpload = (file) => {
  // 模拟上传成功
  showToast({
    message: '头像上传成功',
    className: 'custom-toast'
  })
  // 这里应该调用实际的图片上传接口
  console.log('上传文件:', file)
}

const onOversize = () => {
  showToast({
    message: '文件大小不能超过 1MB',
    className: 'custom-toast'
  })
}

// 导航功能
const goToEditProfile = () => {
  showEditPopup.value = true
}

const goToHistory = () => {
  router.push('/history')
}

const goToSettings = () => {
  router.push('/settings')
}

const goToAbout = () => {
  router.push('/about')
}

const goToHelpFeedback = () => {
  router.push('/help-feedback')
}



// 根据数值水平获取等级分类
const getLevelCategory = (level) => {
  if (level === '初级') return '初级'
  if (level === '进阶') return '进阶'
  if (level === '专业') return '专业'
  
  const numericLevel = parseFloat(level)
  if (numericLevel <= 3.0) return '初级'
  if (numericLevel <= 4.0) return '进阶'
  return '专业'
}

// 保存资料
const handleSaveProfile = (newInfo) => {
  userStore.updateUserInfo(newInfo)
  showEditPopup.value = false
  showToast({
    message: '资料更新成功',
    className: 'custom-toast'
  })
}

// 退出登录
const handleLogout = () => {
  showConfirmDialog({
    title: '确认退出',
    message: '确定要退出登录吗？',
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
</script>

<style scoped>
.profile-container {
  height: 100vh;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
}

.profile-header {
  background: linear-gradient(135deg, #75c7e8 0%, #b2e5cb 100%);
  color: white;
  padding: 40px 20px 30px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.user-avatar {
  position: relative;
  flex-shrink: 0;
}

.upload-icon {
  position: absolute;
  bottom: 0;
  right: 0;
  background: #1989fa;
  color: white;
  border-radius: 50%;
  padding: 4px;
  font-size: 16px;
}

.user-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user-name {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 4px;
  word-wrap: break-word;
}

.user-email {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 12px;
}

.user-bio {
  font-size: 14px;
  opacity: 0.9;
  line-height: 1.4;
  margin-top: 8px;
  word-wrap: break-word;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 8px;
}

.sport-level-info {
  min-width: 140px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
}

.sport-level-tags {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
}

.sport-level-item {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.sport-level-item .van-tag {
  margin: 0;
  flex-shrink: 0;
}

.menu-section {
  margin: 16px 0;
}

.quick-actions {
  background: white;
  margin: 0 16px 16px;
  border-radius: 12px;
  overflow: hidden;
}

.logout-section {
  padding: 0 16px 32px;
}

.logout-btn {
  border: 1px solid #ff4d4f;
  color: #ff4d4f;
}

:deep(.van-grid-item__content) {
  padding: 16px 8px;
}

:deep(.van-grid-item__icon) {
  font-size: 24px;
  margin-bottom: 8px;
}
</style>