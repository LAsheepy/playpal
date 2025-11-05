<template>
  <div class="about-container">
    <!-- 返回按钮 -->
    <van-nav-bar
      title="关于我们"
      left-text="返回"
      left-arrow
      @click-left="goBack"
    />
    
    <!-- 页面内容 -->
    <div class="about-content">
      <!-- 应用Logo和标题 -->
      <div class="header-section">
        <div class="app-logo">
          <van-icon name="friends-o" size="60" color="#3498db" />
        </div>
        <h1 class="app-title">PlayPal</h1>
        <p class="app-subtitle">约球交友平台</p>
      </div>
      
      <!-- 关于内容 -->
      <div class="about-section">
        <div class="about-card">
          <h2>项目介绍</h2>
          <div class="about-text">
            <p>此项目来自一名终身热爱匹克球并将其作为事业的<strong>国家一级不误正业</strong>运动员，署名PlayPal开发者。</p>
            
            <p>PlayPal致力于为运动爱好者提供一个便捷、高效的约球平台，让您能够轻松找到志同道合的球友，享受运动的乐趣。</p>
            
            <h3>平台特色：</h3>
            <ul>
              <li>🏸 支持多种球类运动：匹克球、网球、羽毛球等</li>
              <li>👥 智能匹配：根据水平、位置、时间自动匹配球友</li>
              <li>📊 战绩记录：完整的对战历史和胜率统计</li>
              <li>💬 实时沟通：便捷的聊天和约球功能</li>
              <li>🌟 等级系统：科学的水平评级体系</li>
            </ul>
          </div>
        </div>
      </div>
      
      <!-- 开发者信息 -->
      <div class="developer-section">
        <div class="developer-card">
          <h3>开发者信息</h3>
          <div class="developer-info">
            <div class="developer-item">
              <van-icon name="user-o" />
              <span>开发者：PlayPal团队</span>
            </div>
            <div class="developer-item">
              <van-icon name="envelop-o" />
              <span>联系邮箱：playpal@example.com</span>
            </div>
            <div class="developer-item">
              <van-icon name="clock-o" />
              <span>开发时间：2024年</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 版本信息 -->
      <div class="version-section">
        <div class="version-card">
          <div class="version-item">
            <span class="version-label">当前版本</span>
            <span class="version-value">v1.0.0</span>
          </div>
          <div class="version-item">
            <span class="version-label">更新时间</span>
            <span class="version-value">{{ currentDate }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  NavBar as VanNavBar, 
  Icon as VanIcon 
} from 'vant'

const router = useRouter()

// 获取当前日期
const currentDate = computed(() => {
  return new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.about-container {
  height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  overflow-y: auto;
}

.about-content {
  padding: 20px;
}

/* 头部样式 */
.header-section {
  text-align: center;
  margin-bottom: 30px;
}

.app-logo {
  margin-bottom: 16px;
}

.app-title {
  font-size: 32px;
  font-weight: bold;
  color: #3498db;
  margin: 0 0 8px 0;
}

.app-subtitle {
  font-size: 16px;
  color: #7f8c8d;
  margin: 0;
}

/* 关于内容样式 */
.about-section {
  margin-bottom: 20px;
}

.about-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.about-card h2 {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 16px 0;
  text-align: center;
}

.about-text h3 {
  font-size: 16px;
  font-weight: 600;
  color: #34495e;
  margin: 16px 0 8px 0;
}

.about-text p {
  line-height: 1.6;
  color: #555;
  margin-bottom: 12px;
}

.about-text ul {
  list-style: none;
  padding: 0;
  margin: 12px 0;
}

.about-text li {
  padding: 8px 0;
  line-height: 1.5;
  color: #555;
}

/* 开发者信息样式 */
.developer-section {
  margin-bottom: 20px;
}

.developer-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.developer-card h3 {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 16px 0;
  text-align: center;
}

.developer-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.developer-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.developer-item .van-icon {
  font-size: 18px;
  color: #3498db;
}

.developer-item span {
  font-size: 14px;
  color: #555;
}

/* 版本信息样式 */
.version-section {
  margin-bottom: 20px;
}

.version-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.version-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.version-item:last-child {
  border-bottom: none;
}

.version-label {
  font-size: 14px;
  color: #7f8c8d;
}

.version-value {
  font-size: 14px;
  font-weight: 500;
  color: #3498db;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .about-content {
    padding: 16px;
  }
  
  .about-card, .developer-card, .version-card {
    padding: 20px;
  }
  
  .app-title {
    font-size: 28px;
  }
  
  .about-text h3 {
    font-size: 15px;
  }
}
</style>