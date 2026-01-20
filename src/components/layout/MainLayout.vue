<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Header from './Header.vue'
import Footer from './Footer.vue'

const showBackToTop = ref(false)

const handleScroll = () => {
  showBackToTop.value = window.scrollY > 300
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="main-layout">
    <Header />
    <main class="main-content">
      <div class="content-wrapper">
        <slot></slot>
      </div>
    </main>
    <Footer />

    <!-- Back to Top Button -->
    <div class="back-to-top" :class="{ show: showBackToTop }" @click="scrollToTop">
      <img src="/outbox_top.png" alt="返回顶部">
    </div>
  </div>
</template>

<style scoped>
.main-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.main-content {
  flex: 1;
}

.content-wrapper {
  width: 100%;
}

/* Back to Top Button */
.back-to-top {
  position: fixed;
  left: 50%;
  margin-left: 620px;
  bottom: 20px;
  cursor: pointer;
  z-index: 9999;
  display: none;
  background: #666;
  border-radius: 5px;
  padding: 10px;
}

.back-to-top.show {
  display: inline;
}

.back-to-top:hover {
  background: #555;
}

.back-to-top img {
  display: block;
}
</style>
