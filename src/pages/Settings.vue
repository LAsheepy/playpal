<template>
  <div class="settings-container">
    <!-- 返回按钮 -->
    <van-nav-bar
      title="设置"
      left-text="返回"
      left-arrow
      @click-left="goBack"
    />
    
    <!-- 设置选项 -->
    <div class="settings-list">
      <van-cell-group>
        <van-cell title="账号设置" icon="user-o" is-link @click="goToAccountSettings" />
        <van-cell title="通知设置" icon="bell" is-link @click="goToNotificationSettings" />
        <van-cell title="隐私设置" icon="lock" is-link @click="goToPrivacySettings" />
        <van-cell title="关于我们" icon="info-o" is-link @click="goToAbout" />
        <van-cell title="帮助与反馈" icon="question-o" is-link @click="goToHelp" />
      </van-cell-group>
      
      <div class="action-section">
        <van-button 
          type="default" 
          block 
          @click="clearCache"
          class="action-btn"
        >
          清除缓存
        </van-button>
        <van-button 
          type="danger" 
          block 
          @click="logout"
          class="action-btn"
        >
          退出登录
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { showConfirmDialog, showToast } from 'vant'
import {
  NavBar as VanNavBar,
  CellGroup as VanCellGroup,
  Cell as VanCell,
  Button as VanButton
} from 'vant'

const router = useRouter()
const userStore = useUserStore()

const goBack = () => {
  router.back()
}

const goToAccountSettings = () => {
  showToast('账号设置功能开发中')
}

const goToNotificationSettings = () => {
  showToast('通知设置功能开发中')
}

const goToPrivacySettings = () => {
  showToast('隐私设置功能开发中')
}

const goToAbout = () => {
  showToast('关于我们功能开发中')
}

const goToHelp = () => {
  showToast('帮助与反馈功能开发中')
}

const clearCache = () => {
  showConfirmDialog({
    title: '清除缓存',
    message: '确定要清除所有缓存数据吗？'
  }).then(() => {
    localStorage.clear()
    showToast('缓存清除成功')
  }).catch(() => {
    // 用户取消
  })
}

const logout = () => {
  showConfirmDialog({
    title: '退出登录',
    message: '确定要退出登录吗？'
  }).then(() => {
    userStore.logout()
    router.push('/login')
    showToast('退出登录成功')
  }).catch(() => {
    // 用户取消
  })
}
</script>

<style scoped>
.settings-container {
  height: 100vh;
  background-color: #f8f9fa;
}

.settings-list {
  padding: 16px;
}

.action-section {
  margin-top: 24px;
}

.action-btn {
  margin-bottom: 12px;
}
</style>