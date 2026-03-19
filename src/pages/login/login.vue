<template>
  <view class="login-page">
    <!-- 背景粒子效果 -->
    <view class="bg-particles">
      <view v-for="i in 20" :key="i" class="particle" :style="particleStyle(i)" />
    </view>

    <!-- Logo 区域 -->
    <view class="logo-section">
      <text class="logo-icon">🌌</text>
      <text class="logo-title">LifeLine</text>
      <text class="logo-subtitle">每个选择，都是一条新的世界线</text>
    </view>

    <!-- 表单区域 -->
    <view class="form-section">
      <!-- 切换标签 -->
      <view class="tab-bar">
        <view
          class="tab-item"
          :class="{ active: mode === 'login' }"
          @click="mode = 'login'"
        >
          <text>登录</text>
        </view>
        <view
          class="tab-item"
          :class="{ active: mode === 'register' }"
          @click="mode = 'register'"
        >
          <text>注册</text>
        </view>
      </view>

      <!-- 注册时的昵称输入 -->
      <view v-if="mode === 'register'" class="input-group">
        <text class="input-label">昵称</text>
        <input
          v-model="nickname"
          class="input-field"
          placeholder="给自己取个名字"
          maxlength="20"
        />
      </view>

      <!-- 邮箱输入 -->
      <view class="input-group">
        <text class="input-label">邮箱</text>
        <input
          v-model="email"
          class="input-field"
          type="text"
          placeholder="your@email.com"
        />
      </view>

      <!-- 密码输入 -->
      <view class="input-group">
        <text class="input-label">密码</text>
        <input
          v-model="password"
          class="input-field"
          type="password"
          :placeholder="mode === 'register' ? '至少6位密码' : '输入密码'"
        />
      </view>

      <!-- 错误提示 -->
      <view v-if="errorMsg" class="error-msg">
        <text>{{ errorMsg }}</text>
      </view>

      <!-- 提交按钮 -->
      <view
        class="submit-btn"
        :class="{ loading: isLoading }"
        @click="handleSubmit"
      >
        <text v-if="!isLoading">{{ mode === 'login' ? '进入世界线' : '开始新旅程' }}</text>
        <text v-else>连接中...</text>
      </view>
    </view>

    <!-- 底部信息 -->
    <view class="footer">
      <text class="footer-text">V4 · 万物皆涟漪</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { authApi, setToken } from '@/api/index'
import { useUserStore } from '@/stores/user'

const mode = ref<'login' | 'register'>('login')
const email = ref('')
const password = ref('')
const nickname = ref('')
const errorMsg = ref('')
const isLoading = ref(false)

const userStore = useUserStore()

function particleStyle(i: number) {
  const size = 2 + Math.random() * 4
  const x = Math.random() * 100
  const y = Math.random() * 100
  const delay = Math.random() * 5
  const duration = 3 + Math.random() * 4
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${x}%`,
    top: `${y}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
  }
}

async function handleSubmit() {
  errorMsg.value = ''

  // 基本校验
  if (!email.value.trim()) {
    errorMsg.value = '请输入邮箱'
    return
  }
  if (!password.value) {
    errorMsg.value = '请输入密码'
    return
  }
  if (mode.value === 'register' && !nickname.value.trim()) {
    errorMsg.value = '请输入昵称'
    return
  }

  isLoading.value = true

  try {
    if (mode.value === 'login') {
      const res = await authApi.login(email.value.trim(), password.value)
      if (res.error) {
        errorMsg.value = res.error
        return
      }
      setToken(res.data!.token)
      userStore.setUserFromApi(res.data!.user)
    } else {
      const res = await authApi.register(
        email.value.trim(),
        password.value,
        nickname.value.trim()
      )
      if (res.error) {
        errorMsg.value = res.error
        return
      }
      setToken(res.data!.token)
      userStore.setUserFromApi(res.data!.user)
    }

    // 登录成功，跳转到首页
    uni.switchTab({ url: '/pages/index/index' })
  } catch (err) {
    errorMsg.value = '网络连接失败，请检查后端是否启动'
  } finally {
    isLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0e1a 0%, #1a1e3a 50%, #0a0e1a 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 30px;
  position: relative;
  overflow: hidden;
}

// 背景粒子
.bg-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.particle {
  position: absolute;
  background: rgba(0, 229, 255, 0.3);
  border-radius: 50%;
  animation: float 4s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { opacity: 0.2; transform: translateY(0); }
  50% { opacity: 0.8; transform: translateY(-20px); }
}

// Logo
.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 50px;
  z-index: 1;
}

.logo-icon {
  font-size: 60px;
  margin-bottom: 12px;
}

.logo-title {
  font-size: 36px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 4px;
}

.logo-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 8px;
}

// 表单
.form-section {
  width: 100%;
  max-width: 360px;
  z-index: 1;
}

.tab-bar {
  display: flex;
  margin-bottom: 30px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 4px;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 10px 0;
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.4);
  font-size: 15px;
  transition: all 0.3s;

  &.active {
    background: rgba(0, 229, 255, 0.15);
    color: #00e5ff;
  }
}

.input-group {
  margin-bottom: 20px;
}

.input-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 8px;
  display: block;
}

.input-field {
  width: 100%;
  height: 48px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 0 16px;
  color: #ffffff;
  font-size: 15px;
  box-sizing: border-box;
  transition: border-color 0.3s;

  &:focus {
    border-color: rgba(0, 229, 255, 0.5);
  }
}

.error-msg {
  margin-bottom: 16px;
  padding: 10px 14px;
  background: rgba(255, 82, 82, 0.15);
  border: 1px solid rgba(255, 82, 82, 0.3);
  border-radius: 8px;
  color: #ff5252;
  font-size: 13px;
}

.submit-btn {
  width: 100%;
  height: 50px;
  background: linear-gradient(135deg, #00e5ff 0%, #00b0ff 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0a0e1a;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 2px;
  transition: all 0.3s;
  cursor: pointer;

  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }

  &.loading {
    opacity: 0.6;
    pointer-events: none;
  }
}

// 底部
.footer {
  position: absolute;
  bottom: 30px;
  z-index: 1;
}

.footer-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.2);
}
</style>
