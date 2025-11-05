<template>
  <div class="avatar-container" :style="containerStyle">
    <img
      v-if="showRealAvatar && realAvatar"
      :src="realAvatar"
      :alt="alt"
      :class="avatarClass"
      @error="handleImageError"
    />
    <div
      v-else
      class="avatar-placeholder"
      :style="placeholderStyle"
    >
      {{ displayChar }}
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { AvatarGenerator } from '../utils/avatarGenerator'

const props = defineProps({
  // 用户信息
  nickname: {
    type: String,
    default: '用户'
  },
  userId: {
    type: [String, Number],
    default: null
  },
  // 头像URL（真实头像）
  src: {
    type: String,
    default: ''
  },
  // 替代文本
  alt: {
    type: String,
    default: '头像'
  },
  // 尺寸
  size: {
    type: [String, Number],
    default: 80
  },
  // 是否显示边框
  bordered: {
    type: Boolean,
    default: false
  }
})

// 状态
const imageError = ref(false)

// 计算属性
const showRealAvatar = computed(() => {
  return props.src && !imageError.value
})

const realAvatar = computed(() => props.src)

const displayChar = computed(() => {
  return AvatarGenerator.extractDisplayChar(props.nickname)
})

const avatarInfo = computed(() => {
  return AvatarGenerator.getSimpleAvatar(props.nickname, props.userId)
})

// 样式
const containerStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`
}))

const avatarClass = computed(() => ({
  'avatar-img': true,
  'avatar-bordered': props.bordered
}))

const placeholderStyle = computed(() => ({
  backgroundColor: avatarInfo.value.color,
  fontSize: `${parseInt(props.size) * 0.4}px`
}))

// 事件处理
const handleImageError = () => {
  imageError.value = true
}
</script>

<style scoped>
.avatar-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.avatar-img.avatar-bordered {
  border: 2px solid #f0f0f0;
  box-sizing: border-box;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  font-family: system-ui, -apple-system, sans-serif;
}
</style>