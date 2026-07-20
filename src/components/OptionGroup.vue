<script setup>
defineProps({
  label: { type: String, required: true },
  options: { type: Array, required: true },
  modelValue: { type: String, required: true },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <fieldset class="option-group">
    <legend>{{ label }}</legend>
    <div class="option-list">
      <button
        v-for="option in options"
        :key="option"
        type="button"
        :class="{ active: modelValue === option }"
        @click="$emit('update:modelValue', option)"
      >
        {{ option }}
      </button>
    </div>
  </fieldset>
</template>

<style scoped>
.option-group {
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}

legend {
  margin-bottom: 10px;
  color: var(--ink-muted);
  font-size: 13px;
  font-weight: 700;
}

.option-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

button {
  min-height: 36px;
  padding: 8px 13px;
  border: 1px solid var(--line);
  border-radius: 999px;
  color: var(--ink-soft);
  background: var(--paper);
  font: inherit;
  font-size: 13px;
  cursor: pointer;
  transition: 160ms ease;
}

button:hover {
  border-color: #c8bdb2;
  color: var(--ink);
  transform: translateY(-1px);
}

button.active {
  border-color: var(--ink);
  color: var(--paper);
  background: var(--ink);
  box-shadow: 0 5px 12px rgba(36, 30, 25, 0.14);
}
</style>
