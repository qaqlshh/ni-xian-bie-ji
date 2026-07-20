<script setup>
import { ref } from 'vue'
import ResultCard from './ResultCard.vue'
import { downloadShareCard } from '../utils/shareCard'

const props = defineProps({
  error: { type: String, default: '' },
  loading: { type: Boolean, default: false },
  original: { type: String, required: true },
  results: { type: Object, default: null },
})

defineEmits(['retry'])
const copiedKey = ref('')
const shareError = ref('')

const cards = [
  { key: 'gentle', label: '降一点', description: '先把刺收一收', tone: 'gentle' },
  { key: 'direct', label: '照直说', description: '意思直接说明白', tone: 'direct' },
  { key: 'spicy', label: '带着火', description: '有脾气，但不骂人', tone: 'spicy' },
]

async function copyText(key, text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      textarea.remove()
    }
    copiedKey.value = key
    window.setTimeout(() => {
      if (copiedKey.value === key) copiedKey.value = ''
    }, 1800)
  } catch {
    copiedKey.value = ''
  }
}

async function share(card, text) {
  shareError.value = ''
  try {
    await downloadShareCard({ original: props.original, result: text, label: card.label })
  } catch (error) {
    shareError.value = error.message || '分享图生成失败。'
  }
}
</script>

<template>
  <section class="result-panel" aria-live="polite">
    <div v-if="error" class="error-state">
      <span aria-hidden="true">！</span>
      <div>
        <strong>这次没抢救回来</strong>
        <p>{{ error }}</p>
      </div>
      <button type="button" :disabled="loading" @click="$emit('retry')">{{ loading ? '重试中…' : '再试一次' }}</button>
    </div>

    <template v-else-if="results">
      <div class="result-heading">
        <div>
          <span>翻译结果</span>
          <h2>火气没丢，挑一句发</h2>
        </div>
        <small>不满意就拉一下重来</small>
      </div>
      <div class="result-list">
        <ResultCard
          v-for="card in cards"
          :key="card.key"
          :copied="copiedKey === card.key"
          :description="card.description"
          :label="card.label"
          :text="results[card.key]"
          :tone="card.tone"
          @copy="copyText(card.key, results[card.key])"
          @share="share(card, results[card.key])"
        />
      </div>
      <p v-if="shareError" class="share-error">{{ shareError }}</p>
    </template>
  </section>
</template>

<style scoped>
.result-panel {
  scroll-margin-top: 24px;
  width: min(100%, 550px);
  margin-top: 26px;
}

.result-heading,
.error-state {
  display: flex;
  align-items: center;
}

.result-heading {
  justify-content: space-between;
  gap: 20px;
  padding: 0 4px 13px;
}

.result-heading span {
  color: var(--danger);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.12em;
}

.result-heading h2 {
  margin: 2px 0 0;
  font-family: var(--display);
  font-size: 25px;
}

.result-heading small {
  color: var(--ink-muted);
  font-size: 10px;
}

.result-list {
  display: grid;
  gap: 11px;
}

.error-state {
  gap: 14px;
  padding: 18px;
  border: 1px solid #e5c4bb;
  border-radius: 18px;
  background: #fff4ef;
}

.error-state > span {
  display: grid;
  flex: 0 0 auto;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 50%;
  color: white;
  background: var(--danger);
  font-weight: 900;
}

.error-state div {
  flex: 1;
}

.error-state strong {
  font-size: 13px;
}

.error-state p,
.share-error {
  margin: 3px 0 0;
  color: var(--ink-muted);
  font-size: 11px;
}

.error-state button {
  padding: 8px 12px;
  border: 0;
  border-radius: 9px;
  color: white;
  background: var(--ink);
  font: inherit;
  font-size: 11px;
  cursor: pointer;
}

.share-error {
  color: var(--danger);
  text-align: center;
}

@media (max-width: 620px) {
  .result-panel {
    width: 100%;
    max-width: 100%;
  }

  .result-heading small {
    display: none;
  }
}
</style>
