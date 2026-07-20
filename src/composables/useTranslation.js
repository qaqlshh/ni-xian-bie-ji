import { computed, ref } from 'vue'
import { requestTranslation } from '../services/translatorApi'

export function useTranslation() {
  const status = ref('idle')
  const results = ref(null)
  const error = ref('')
  const lastPayload = ref(null)

  const isLoading = computed(() => status.value === 'loading')

  async function translate(payload) {
    if (isLoading.value) return false
    status.value = 'loading'
    error.value = ''
    results.value = null
    lastPayload.value = payload

    try {
      results.value = await requestTranslation(payload)
      status.value = 'success'
      return true
    } catch (requestError) {
      error.value = requestError.message || '翻译失败了，再来一次。'
      status.value = 'error'
      return false
    }
  }

  function retry() {
    if (lastPayload.value) return translate(lastPayload.value)
    return Promise.resolve(false)
  }

  return { error, isLoading, lastPayload, results, retry, status, translate }
}
