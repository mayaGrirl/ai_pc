import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getWebConfig } from '@/api/home'
import type { webConfig } from '@/types/index.type'

export const useConfigStore = defineStore('config', () => {
  // 状态
  const sysConfig = ref<webConfig | null>(null)
  const loading = ref(false)
  const loaded = ref(false)

  // 计算属性
  const connetQQ = computed(() => sysConfig.value?.connet_qq || '228711')
  const h5Url = computed(() => sysConfig.value?.h5_url || '')
  const pcUrl = computed(() => sysConfig.value?.pc_url || '')
  const appName = computed(() => sysConfig.value?.app_name || '')
  const appLogo = computed(() => sysConfig.value?.app_logo || '')
  const customerLink = computed(() => sysConfig.value?.customer_link || '')
  const picUrl = computed(() => sysConfig.value?.pic_url || '')

  // 获取配置（只请求一次）
  async function fetchConfig() {
    // 如果已经加载过或正在加载，直接返回
    if (loaded.value || loading.value) {
      return sysConfig.value
    }

    loading.value = true
    try {
      const res = await getWebConfig()
      if (res.code === 200 && res.data) {
        sysConfig.value = res.data
        loaded.value = true
      }
    } catch (error) {
      console.error('获取系统配置失败:', error)
    } finally {
      loading.value = false
    }

    return sysConfig.value
  }

  // 强制刷新配置
  async function refreshConfig() {
    loaded.value = false
    return fetchConfig()
  }

  return {
    // 状态
    sysConfig,
    loading,
    loaded,
    // 计算属性
    connetQQ,
    h5Url,
    pcUrl,
    appName,
    appLogo,
    customerLink,
    picUrl,
    // 方法
    fetchConfig,
    refreshConfig
  }
})
