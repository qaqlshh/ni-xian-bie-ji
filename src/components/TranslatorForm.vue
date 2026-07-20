<script setup>
import { computed, ref } from 'vue'
import FireSlider from './FireSlider.vue'
import OptionGroup from './OptionGroup.vue'
import { intentOptions, relationOptions } from '../data/translatorOptions'

defineProps({
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['translate'])
const originalText = ref('你们是不是一天一个想法，钱也一天一结？')
const relation = ref('甲方')
const intent = ref('发火')
const fire = ref(70)
const characterCount = computed(() => Array.from(originalText.value).length)

function submit() {
  if (!originalText.value.trim()) return
  emit('translate', {
    text: originalText.value.trim(),
    relation: relation.value,
    intent: intent.value,
    fire: fire.value,
  })
}
</script>

<template>
  <section class="translator-card" aria-labelledby="translator-title">
    <div class="card-header">
      <div>
        <span class="step-label"><i aria-hidden="true"></i> 发送前抢救室</span>
        <h2 id="translator-title">原话先放这儿</h2>
      </div>
      <span class="status-pill">不会自动发送</span>
    </div>

    <label class="textarea-wrap">
      <textarea v-model="originalText" maxlength="300" placeholder="有什么话，先打完再说……"></textarea>
      <span>{{ characterCount }}/300</span>
    </label>

    <div class="form-grid">
      <OptionGroup v-model="relation" label="对面是谁？" :options="relationOptions" />
      <OptionGroup v-model="intent" label="这次想干嘛？" :options="intentOptions" />
    </div>

    <FireSlider v-model="fire" />

    <button class="translate-button" type="button" :disabled="loading || !originalText.trim()" @click="submit">
      <span>{{ loading ? '正在抢救这句话…' : '翻一下，先别发' }}</span>
      <span v-if="!loading" class="button-arrow" aria-hidden="true">→</span>
      <span v-else class="button-loader" aria-hidden="true"></span>
    </button>

    <p class="form-note"><span aria-hidden="true">⌁</span> 不会替你道歉，也不会偷偷把火气删了</p>
  </section>
</template>

<style scoped>
.translator-card {
  position: relative;
  width: min(100%, 550px);
  padding: 28px;
  border: 1px solid rgba(91, 72, 58, 0.11);
  border-radius: 26px;
  background: rgba(255, 253, 249, 0.96);
  box-shadow:
    0 2px 3px rgba(61, 43, 31, 0.03),
    0 22px 60px rgba(61, 43, 31, 0.11);
  backdrop-filter: blur(20px);
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.step-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--danger);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.11em;
}

.step-label i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--danger);
  box-shadow: 0 0 0 4px rgba(189, 56, 39, 0.1);
}

h2 {
  margin: 6px 0 0;
  color: var(--ink);
  font-family: var(--display);
  font-size: clamp(25px, 3vw, 30px);
  line-height: 1.2;
}

.status-pill {
  padding: 7px 11px;
  border: 1px solid #ece4dc;
  border-radius: 999px;
  color: #8b7f75;
  background: #faf7f2;
  font-size: 10px;
  white-space: nowrap;
}

.textarea-wrap {
  position: relative;
  display: block;
}

textarea {
  box-sizing: border-box;
  width: 100%;
  min-height: 132px;
  resize: none;
  padding: 17px 18px 32px;
  border: 1px solid #e9e0d7;
  border-radius: 18px;
  outline: none;
  color: var(--ink);
  background: #faf7f2;
  font: inherit;
  font-size: 15px;
  line-height: 1.7;
  transition: 160ms ease;
}

textarea:focus {
  border-color: rgba(189, 56, 39, 0.42);
  background: #fffdf9;
  box-shadow: 0 0 0 4px rgba(189, 56, 39, 0.07);
}

.textarea-wrap > span {
  position: absolute;
  right: 14px;
  bottom: 11px;
  color: var(--ink-faint);
  font-size: 11px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin: 14px 0;
}

.translate-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 56px;
  margin-top: 14px;
  padding: 0 10px 0 19px;
  border: 0;
  border-radius: 16px;
  color: #fffaf3;
  background: var(--danger);
  font: inherit;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  transition: 160ms ease;
}

.translate-button:hover {
  transform: translateY(-2px);
  background: #aa3022;
  box-shadow: 0 12px 24px rgba(170, 48, 34, 0.22);
}

.translate-button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
  transform: none;
}

.button-arrow {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.14);
  font-size: 20px;
}

.button-loader {
  width: 17px;
  height: 17px;
  border: 2px solid rgba(255, 250, 243, 0.35);
  border-top-color: #fffaf3;
  border-radius: 50%;
  animation: spin 700ms linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.form-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  margin: 13px 0 0;
  color: var(--ink-muted);
  font-size: 10px;
  text-align: center;
}

.form-note span {
  color: var(--danger);
  font-size: 14px;
}

@media (max-width: 620px) {
  .translator-card {
    width: 100%;
    max-width: 100%;
    padding: 20px;
    border-radius: 22px;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .status-pill {
    display: none;
  }
}
</style>
