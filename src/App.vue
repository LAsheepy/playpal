<template>
  <div id="app">
    <router-view v-if="!showTabBar" />
    <div v-else class="app-container">
      <router-view />
      <van-tabbar v-model="activeTab" @change="onTabChange">
        <van-tabbar-item icon="home-o" to="/home">球局</van-tabbar-item>
        <van-tabbar-item icon="user-o" to="/profile">我的</van-tabbar-item>
      </van-tabbar>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Tabbar as VanTabbar, TabbarItem as VanTabbarItem } from 'vant'

const route = useRoute()
const activeTab = ref(0)

// 不需要显示底部导航栏的页面
const showTabBar = computed(() => {
  const noTabBarRoutes = ['/login', '/my-matches', '/history', '/settings', '/user', '/admin']
  return !noTabBarRoutes.some(routePath => route.path.startsWith(routePath))
})

const onTabChange = (index) => {
  activeTab.value = index
}
</script>

<style>
#app {
  height: 100vh;
  background-color: #f8f9fa;
}

.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-container > :first-child {
  flex: 1;
  overflow-y: auto;
}
</style>