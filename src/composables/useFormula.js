import formulas from '../i18n/formulas.json'

/**
 * 通过模块路径获取公式名称文本
 * @param {string} path  'module.submodule' 格式，如 'laser.gaussian'
 * @param {string} lang  'cn' 或 'en'
 * @returns {string}
 *
 * 用法：
 *   const t = useFormula()
 *   t('laser.gaussian')        // "高斯光束传播"
 *   t('laser.gaussian', 'en')  // "Gaussian Beam Propagation"
 */
export function useFormula() {
  return (path, lang = 'cn') => {
    const keys = path.split('.')
    let obj = formulas
    for (const k of keys) {
      if (!obj || !obj[k]) return path
      obj = obj[k]
    }
    return obj[lang] || path
  }
}
