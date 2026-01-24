import {createI18n} from 'vue-i18n'
import zh from './locales/zh.json'
import en from './locales/en.json'

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('locale') || 'zh',
  fallbackLocale: 'zh',
  messages: {
    zh,
    en
  },
  numberFormats: {
    en: {
      currency: {
        style: 'currency',
        currency: 'USD'
      }
    },
    zh: {
      currency: {
        style: 'currency',
        currency: 'CNY'
      }
    }
  }
})

export default i18n


/**
 * locale → currency 映射关系
 * 格式化金额转换成带币种符号。
 * eg: ¥100 $100 ...
 */
export const LOCALE_CURRENCY_MAP: Record<string, string> = {
  'zh': 'CNY',
  'en': 'USD',
  'fr': 'EUR',
};
