<template>
  <div class="login-container">
    <div class="login-header">
      <h1>碰球 PlayPal</h1>
      <p>找到合适的球友，一起打球</p>
    </div>
    
    <div class="login-form">
      <van-form @submit="onSubmit">
        <van-cell-group>
          <van-field
            v-model="form.email"
            name="邮箱"
            label="邮箱"
            placeholder="请输入邮箱地址"
            :rules="[{ required: true, message: '请填写邮箱' }]"
          />
          <van-field
            v-model="form.password"
            type="password"
            name="密码"
            label="密码"
            placeholder="请输入密码"
            :rules="[{ required: true, message: '请填写密码' }]"
          />
        </van-cell-group>
        
        <div style="margin: 16px;">
          <van-button round block type="primary" native-type="submit">
            {{ isLogin ? '登录' : '注册' }}
          </van-button>
        </div>
      </van-form>
      
      <div class="switch-mode">
        <span @click="toggleMode">
          {{ isLogin ? '没有账号？立即注册' : '已有账号？立即登录' }}
        </span>
      </div>
      
      <!-- 游客登录入口 -->
      <div class="guest-login-section">
        <div class="divider">
          <span>或</span>
        </div>
        <div style="margin: 16px;">
          <van-button 
            round 
            block 
            type="default" 
            @click="onGuestLogin"
            class="guest-login-btn"
          >
            🎯 游客登录
          </van-button>
        </div>
        <div class="guest-notice">
          <p>💡 无需注册，立即体验</p>
        </div>
      </div>
      
      <!-- 管理员登录入口 -->
      <div class="admin-login-section">
        <div class="divider">
          <span>管理员</span>
        </div>
        <div style="margin: 16px;">
          <van-button 
            round 
            block 
            type="warning" 
            @click="onAdminLogin"
            class="admin-login-btn"
          >
            🔧 管理员登录
          </van-button>
        </div>
        <div class="admin-notice">
          <p>⚙️ 访问数据总览和管理功能</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { 
  showToast,
  Form as VanForm,
  CellGroup as VanCellGroup,
  Field as VanField,
  Button as VanButton
} from 'vant'

const router = useRouter()
const userStore = useUserStore()
const isLogin = ref(true)
const form = ref({
  email: '',
  password: ''
})

const toggleMode = () => {
  isLogin.value = !isLogin.value
}

const onSubmit = async () => {
  try {
    // 实际调用用户存储的登录/注册方法
    if (isLogin.value) {
      const result = await userStore.login(form.value.email, form.value.password)
      if (result.success) {
        showToast({
          message: '登录成功',
          type: 'success',
          className: 'custom-toast'
        })
        // 跳转到首页
        setTimeout(() => {
          router.push('/home')
        }, 1000)
      } else {
        showToast({
          message: result.error || '登录失败，请检查账号密码',
          type: 'fail',
          className: 'custom-toast'
        })
      }
    } else {
      const result = await userStore.register(form.value.email, form.value.password)
      if (result.success) {
        showToast({
          message: '注册成功',
          type: 'success',
          className: 'custom-toast'
        })
        // 跳转到首页
        setTimeout(() => {
          router.push('/home')
        }, 1000)
      } else {
        showToast({
          message: result.error || '注册失败，请重试',
          type: 'fail',
          className: 'custom-toast'
        })
      }
    }
  } catch (error) {
    showToast({
      message: '操作失败，请重试',
      type: 'fail',
      className: 'custom-toast'
    })
  }
}

// 游客登录
const onGuestLogin = async () => {
  try {
    const result = await userStore.guestLogin()
    if (result.success) {
      showToast({
        message: '游客模式已开启',
        type: 'success',
        className: 'custom-toast'
      })
      // 跳转到首页
      setTimeout(() => {
        router.push('/home')
      }, 1000)
    } else {
      showToast({
        message: result.error || '游客登录失败',
        type: 'fail',
        className: 'custom-toast'
      })
    }
  } catch (error) {
    showToast({
      message: '游客登录失败，请重试',
      type: 'fail',
      className: 'custom-toast'
    })
  }
}

// 管理员登录
const onAdminLogin = () => {
  // 弹出对话框让管理员输入账号密码
  const adminEmail = prompt('请输入管理员邮箱：')
  if (!adminEmail) return
  
  const adminPassword = prompt('请输入管理员密码：')
  if (!adminPassword) return
  
  // 验证管理员凭据
  if (adminEmail === 'admin@playpal.com' && adminPassword === 'admin123') {
    // 使用管理员账号登录
    handleAdminLogin(adminEmail, adminPassword)
  } else {
    showToast({
      message: '管理员账号或密码错误',
      type: 'fail',
      className: 'custom-toast'
    })
  }
}

// 处理管理员登录
const handleAdminLogin = async (email, password) => {
  try {
    const result = await userStore.login(email, password)
    if (result.success) {
      showToast({
        message: '管理员登录成功',
        type: 'success',
        className: 'custom-toast'
      })
      // 跳转到管理员页面
      setTimeout(() => {
        router.push('/admin')
      }, 1000)
    } else {
      showToast({
        message: result.error || '管理员登录失败，请检查账号密码',
        type: 'fail',
        className: 'custom-toast'
      })
    }
  } catch (error) {
    showToast({
      message: '管理员登录失败，请重试',
      type: 'fail',
      className: 'custom-toast'
    })
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.login-header {
  text-align: center;
  color: rgb(64, 127, 211);
  margin-bottom: 30px;
}

.login-header h1 {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 10px;
}

.login-header p {
  font-size: 16px;
  opacity: 0.9;
}

.login-form {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.switch-mode {
  text-align: center;
  margin-top: 20px;
}

.switch-mode span {
  color: #1989fa;
  cursor: pointer;
}

/* 游客登录样式 */
.guest-login-section {
  margin-top: 0px;
  border-top: 1px solid #f0f0f0;
  padding-top: 0px;
}

.divider {
  text-align: center;
  margin: 2px 0;
  position: relative;
}

.divider span {
  background: white;
  padding: 0 15px;
  color: #999;
  font-size: 14px;
  position: relative;
  z-index: 2;
}

.guest-login-btn {
  border: 1px solid #1989fa;
  color: #1989fa;
  background: white;
}

.guest-notice {
  text-align: center;
  margin-top: 15px;
  font-size: 12px;
  color: #666;
  line-height: 1.5;
}

.guest-notice p {
  margin: 5px 0;
}

/* 管理员登录样式 */
.admin-login-section {
  margin-top: 2px;
  border-top: 1px solid #f0f0f0;
  padding-top: 2px;
}

.admin-login-btn {
  border: 1px solid #ff976a;
  color: #ff976a;
  background: white;
}

.admin-notice {
  text-align: center;
  margin-top: 15px;
  font-size: 12px;
  color: #666;
  line-height: 1.5;
}

.admin-notice p {
  margin: 5px 0;
}

/* 自定义弹窗样式 */
:deep(.custom-toast) {
  color: #333 !important;
  background-color: rgb(255, 255, 255) !important;
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