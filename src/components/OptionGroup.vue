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
  padding: 14px;
  border: 1px solid #eee6dd;
  border-radius: 17px;
  background: #faf7f2;
}

legend {
  width: auto;
  padding: 0 4px;
  color: #887a6f;
  font-size: 11px;
  font-weight: 800;
}

.option-list {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 9px;
}

button {
  min-height: 34px;
  padding: 7px 12px;
  border: 1px solid #e9dfd5;
  border-radius: 999px;
  color: var(--ink-soft);
  background: #fff;
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
  border-color: var(--danger);
  color: var(--paper);
  background: var(--danger);
  box-shadow: 0 5px 12px rgba(189, 56, 39, 0.17);
}

@media (max-width: 620px) {
  .option-group {
    padding: 13px;
  }
}
</style>
