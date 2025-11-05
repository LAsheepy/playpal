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
        <van-cell title="清除缓存" icon="delete-o" is-link @click="clearCache" />
      </van-cell-group>
      
      <div class="action-section">
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
  showToast({
    message: '账号设置功能开发中',
    className: 'custom-toast'
  })
}

const goToNotificationSettings = () => {
  showToast({
    message: '通知设置功能开发中',
    className: 'custom-toast'
  })
}

const goToPrivacySettings = () => {
  showToast({
    message: '隐私设置功能开发中',
    className: 'custom-toast'
  })
}

const goToAbout = () => {
  showToast({
    message: '关于我们功能开发中',
    className: 'custom-toast'
  })
}

const goToHelp = () => {
  showToast({
    message: '帮助与反馈功能开发中',
    className: 'custom-toast'
  })
}

const clearCache = () => {
  showConfirmDialog({
    title: '清除缓存',
    message: '确定要清除所有缓存数据吗？',
    className: 'custom-dialog'
  }).then(() => {
    localStorage.clear()
    showToast({
      message: '缓存清除成功',
      className: 'custom-toast'
    })
  }).catch(() => {
    // 用户取消
  })
}

const logout = () => {
  showConfirmDialog({
    title: '退出登录',
    message: '确定要退出登录吗？',
    className: 'custom-dialog'
  }).then(() => {
    userStore.logout()
    router.push('/login')
    showToast({
      message: '退出登录成功',
      className: 'custom-toast'
    })
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