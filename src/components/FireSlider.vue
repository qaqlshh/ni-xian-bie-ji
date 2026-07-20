<script setup>
import { computed } from 'vue'
import { fireLabel } from '../data/translatorOptions'

const props = defineProps({
  modelValue: { type: Number, required: true },
})

const emit = defineEmits(['update:modelValue'])
const label = computed(() => fireLabel(props.modelValue))
</script>

<template>
  <div class="fire-control">
    <div class="fire-heading">
      <span>留几成火？</span>
      <strong>{{ modelValue }}% · {{ label }}</strong>
    </div>
    <div class="range-wrap">
      <span>好好说</span>
      <input
        :value="modelValue"
        type="range"
        min="0"
        max="100"
        step="10"
        :style="{ '--fire': `${modelValue}%` }"
        aria-label="情绪保留比例"
        @input="emit('update:modelValue', Number($event.target.value))"
      />
      <span>开大</span>
    </div>
  </div>
</template>

<style scoped>
.fire-control {
  padding: 15px 16px 14px;
  border: 1px solid #eadfd3;
  border-radius: 16px;
  background: #fff9f3;
}

.fire-heading,
.range-wrap {
  display: flex;
  align-items: center;
}

.fire-heading {
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 13px;
  font-weight: 700;
}

.fire-heading span {
  color: var(--ink-muted);
}

.fire-heading strong {
  color: var(--danger);
}

.range-wrap {
  gap: 10px;
  color: var(--ink-muted);
  font-size: 11px;
  white-space: nowrap;
}

input {
  width: 100%;
  height: 6px;
  margin: 0;
  border-radius: 999px;
  outline: none;
  appearance: none;
  background: linear-gradient(90deg, #f3b35f 0 var(--fire), #eadfd3 var(--fire) 100%);
  cursor: pointer;
}

input::-webkit-slider-thumb {
  width: 20px;
  height: 20px;
  border: 4px solid var(--paper);
  border-radius: 50%;
  appearance: none;
  background: var(--danger);
  box-shadow: 0 2px 8px rgba(190, 56, 35, 0.28);
}

input::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border: 4px solid var(--paper);
  border-radius: 50%;
  background: var(--danger);
}
</style>
