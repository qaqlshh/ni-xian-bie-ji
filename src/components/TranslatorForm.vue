<script setup>
import { computed, ref } from 'vue'
import FireSlider from './FireSlider.vue'
import OptionGroup from './OptionGroup.vue'
import { intentOptions, relationOptions } from '../data/translatorOptions'

const emit = defineEmits(['preview'])
const originalText = ref('你们是不是一天一个想法，钱也一天一结？')
const relation = ref('甲方')
const intent = ref('发火')
const fire = ref(70)
const characterCount = computed(() => Array.from(originalText.value).length)
</script>

<template>
  <section class="translator-card" aria-labelledby="translator-title">
    <div class="card-header">
      <div>
        <span class="step-label">发送前抢救室</span>
        <h2 id="translator-title">原话先放这儿</h2>
      </div>
      <span class="status-pill">草稿不会乱跑</span>
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

    <button class="translate-button" type="button" :disabled="!originalText.trim()" @click="emit('preview')">
      <span>先翻译一下</span>
      <span aria-hidden="true">→</span>
    </button>

    <p class="form-note">不会替你道歉，也不会偷偷把火气删了。</p>
  </section>
</template>

<style scoped>
.translator-card {
  position: relative;
  width: min(100%, 550px);
  padding: 26px;
  border: 1px solid rgba(94, 75, 60, 0.13);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 26px 70px rgba(70, 48, 32, 0.13);
  backdrop-filter: blur(18px);
}

.translator-card::before {
  position: absolute;
  inset: 12px -10px -12px 14px;
  z-index: -1;
  border-radius: 28px;
  background: #e9dccc;
  content: '';
  transform: rotate(1.2deg);
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 17px;
}

.step-label {
  color: var(--danger);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.14em;
}

h2 {
  margin: 3px 0 0;
  color: var(--ink);
  font-family: var(--display);
  font-size: clamp(24px, 3vw, 32px);
  line-height: 1.2;
}

.status-pill {
  padding: 7px 10px;
  border-radius: 999px;
  color: #75685e;
  background: #f3ede6;
  font-size: 11px;
  white-space: nowrap;
}

.textarea-wrap {
  position: relative;
  display: block;
}

textarea {
  box-sizing: border-box;
  width: 100%;
  min-height: 118px;
  resize: vertical;
  padding: 16px 17px 30px;
  border: 1px solid var(--line);
  border-radius: 17px;
  outline: none;
  color: var(--ink);
  background: #fffdfa;
  font: inherit;
  font-size: 15px;
  line-height: 1.7;
  transition: 160ms ease;
}

textarea:focus {
  border-color: #bda792;
  box-shadow: 0 0 0 4px rgba(189, 167, 146, 0.15);
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
  gap: 20px;
  margin: 19px 0;
}

.translate-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 53px;
  margin-top: 17px;
  padding: 0 20px;
  border: 0;
  border-radius: 15px;
  color: #fffaf3;
  background: var(--ink);
  font: inherit;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  transition: 160ms ease;
}

.translate-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(40, 31, 25, 0.2);
}

.translate-button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
  transform: none;
}

.translate-button span:last-child {
  font-size: 21px;
}

.form-note {
  margin: 12px 0 0;
  color: var(--ink-muted);
  font-size: 11px;
  text-align: center;
}

@media (max-width: 620px) {
  .translator-card {
    padding: 19px;
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
