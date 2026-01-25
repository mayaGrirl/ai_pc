import { ref } from 'vue'
import { useDebounceFn } from '@vueuse/core'

interface UseTableOptions<T> {
  // 默认分页大小
  defaultSize?: number
  // 转换响应数据
  transform?: (res: any) => { list: T[]; }
  // 初始参数
  initQuery?: Record<string, any>
  // 是否追加模式（无限滚动/点击加载更多）
  appendMode?: boolean
}

export function useTable<T = any>(
  fetchApi: (params: any) => Promise<any>,
  options: UseTableOptions<T> = {}
) {
  const {
    defaultSize = 10,
    transform = (res) => {
      const list = Array.isArray(res.data) ? res.data : (res.data?.list || res.list || [])
      return { list }
    },
    initQuery = {}
  } = options

  const loading = ref(false)
  const dataSource = ref<T[]>([])
  const hasMore = ref(false)

  const pagination = ref({
    page: 1,
    size: defaultSize,
  })

  const query = ref({ ...initQuery })

  // 请求数据
  const loadData = async (resetPage = false) => {
    if (resetPage) {
      pagination.value.page = 1
    }
    loading.value = true
    try {
      // 构造请求参数
      const params = {
        search: { ...query.value },
        pagination: {
          page: pagination.value.page,
          size: pagination.value.size
        }
      }

      const res = await fetchApi(params)

      // 处理响应
      if (res.code === 200) {
        const { list } = transform(res)

        // 如果是追加模式（无限滚动/点击加载更多）
        if (options.appendMode && pagination.value.page > 1) {
          dataSource.value = [...dataSource.value, ...list]
        } else {
          dataSource.value = list
        }

        // 判断是否有更多数据（如果没有返回total，根据当前页数据量判断）
        if (list.length >= pagination.value.size) {
          hasMore.value = true
        } else {
          hasMore.value = false
        }

        // 暴露 hasMore 给外部使用
        return { hasMore, list }
      } else {
        // 如果API返回错误，清空数据
        if (pagination.value.page === 1) {
          dataSource.value = []
        }
        hasMore.value = false
        return { hasMore: false, list: [] }
      }
    } catch (error) {
      console.error('Table load failed:', error)
      dataSource.value = []
      hasMore.value = false
    } finally {
      loading.value = false
    }
  }

  // 防抖查询
  const reload = useDebounceFn(() => {
    void loadData(true)
  }, 300)

  // 翻页
  const changePage = (page: number) => {
    pagination.value.page = page
    void loadData()
  }

  // 改变每页条数
  const changeSize = (size: number) => {
    pagination.value.size = size
    void loadData(true)
  }

  return {
    loading,
    dataSource, // 数据
    hasMore, // 是否还有更多
    pagination, // 分页
    query, // 搜索
    loadData, // 手动加载
    reload,   // 搜索重载（重置页码）
    changePage,
    changeSize
  }
}
