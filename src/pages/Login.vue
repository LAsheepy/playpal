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
            🎯 游客体验
          </van-button>
        </div>
        <div class="guest-notice">
          <p>💡 无需注册，立即体验系统核心功能</p>
          <p>⚠️ 游客模式下数据不会保存</p>
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
          type: 'success'
        })
        // 跳转到首页
        setTimeout(() => {
          router.push('/home')
        }, 1000)
      } else {
        showToast({
          message: result.error || '登录失败，请检查账号密码',
          type: 'fail'
        })
      }
    } else {
      const result = await userStore.register(form.value.email, form.value.password)
      if (result.success) {
        showToast({
          message: '注册成功',
          type: 'success'
        })
        // 跳转到首页
        setTimeout(() => {
          router.push('/home')
        }, 1000)
      } else {
        showToast({
          message: result.error || '注册失败，请重试',
          type: 'fail'
        })
      }
    }
  } catch (error) {
    showToast({
      message: '操作失败，请重试',
      type: 'fail'
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
        type: 'success'
      })
      // 跳转到首页
      setTimeout(() => {
        router.push('/home')
      }, 1000)
    } else {
      showToast({
        message: result.error || '游客登录失败',
        type: 'fail'
      })
    }
  } catch (error) {
    showToast({
      message: '游客登录失败，请重试',
      type: 'fail'
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
  margin-bottom: 60px;
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
  margin-top: 30px;
  border-top: 1px solid #f0f0f0;
  padding-top: 20px;
}

.divider {
  text-align: center;
  margin: 20px 0;
  position: relative;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #f0f0f0;
  z-index: 1;
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
</style>