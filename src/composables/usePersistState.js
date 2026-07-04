import { watch } from 'vue'

const STORAGE_PREFIX = 'optics-calc-'

/**
 * 持久化模块输入状态到 localStorage
 * @param {string} moduleKey  模块唯一标识（如 'bandwidth', 'fiber-dispersion'）
 * @param {object} refs       所有需要持久化的 ref 对象映射
 * @param {object} options    可选：{ debounce: number(ms), onRestore: function }
 *
 * 用法：
 *   const count = ref(1); const unit = ref('nm')
 *   usePersistState('bandwidth', { count, unit })
 *   // 自动保存到 localStorage: optics-calc-bandwidth
 *   // 自动在 mount 时恢复
 */
export function usePersistState(moduleKey, refs, options = {}) {
  const key = STORAGE_PREFIX + moduleKey
  const debounceMs = options.debounce || 300
  let timer = null

  // 恢复
  try {
    const saved = localStorage.getItem(key)
    if (saved) {
      const data = JSON.parse(saved)
      for (const [name, r] of Object.entries(refs)) {
        if (data[name] !== undefined) {
          if (typeof r.value === 'number') {
            r.value = Number(data[name])
          } else if (typeof r.value === 'boolean') {
            r.value = Boolean(data[name])
          } else {
            r.value = data[name]
          }
        }
      }
      if (options.onRestore) options.onRestore(data)
    }
  } catch (e) { /* silent */ }

  // 保存
  const save = () => {
    const data = {}
    for (const [name, r] of Object.entries(refs)) {
      data[name] = r.value
    }
    localStorage.setItem(key, JSON.stringify(data))
  }

  // 监听所有 ref 变化
  for (const r of Object.values(refs)) {
    watch(r, () => {
      clearTimeout(timer)
      timer = setTimeout(save, debounceMs)
    }, { deep: true })
  }
}
