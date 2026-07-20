<script setup>
defineProps({
  active: { type: Boolean, default: false },
  copied: { type: Boolean, default: false },
  description: { type: String, required: true },
  label: { type: String, required: true },
  text: { type: String, required: true },
  tone: { type: String, required: true },
})

defineEmits(['copy', 'share'])
</script>

<template>
  <article class="result-card" :class="[`tone-${tone}`, { active }]">
    <header>
      <div>
        <span>{{ label }}</span>
        <small>{{ description }}</small>
      </div>
      <i aria-hidden="true"></i>
    </header>
    <p>{{ text }}</p>
    <div class="card-actions">
      <button type="button" @click="$emit('copy')">{{ copied ? '复制好了' : '复制' }}</button>
      <button type="button" @click="$emit('share')">生成分享图</button>
    </div>
  </article>
</template>

<style scoped>
.result-card {
  display: grid;
  gap: 16px;
  padding: 20px;
  border: 1px solid #e8dfd6;
  border-radius: 20px;
  background: rgba(255, 253, 249, 0.96);
  transition: 180ms ease;
}

.result-card:hover {
  border-color: rgba(189, 56, 39, 0.25);
  transform: translateY(-2px);
}

header,
.card-actions,
header > div {
  display: flex;
  align-items: center;
}

header {
  justify-content: space-between;
}

header > div {
  gap: 9px;
}

header span {
  color: var(--ink);
  font-size: 14px;
  font-weight: 900;
}

header small {
  color: var(--ink-faint);
  font-size: 10px;
}

header i {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #86a78d;
}

.tone-direct header i { background: #d49a4a; }
.tone-spicy header i { background: var(--danger); }

p {
  margin: 0;
  color: var(--ink-soft);
  font-size: 14px;
  line-height: 1.8;
  white-space: pre-wrap;
}

.card-actions {
  gap: 8px;
}

button {
  padding: 7px 11px;
  border: 1px solid var(--line);
  border-radius: 9px;
  color: var(--ink-soft);
  background: #faf6f0;
  font: inherit;
  font-size: 11px;
  cursor: pointer;
}

button:hover {
  border-color: rgba(189, 56, 39, 0.32);
  color: var(--danger);
}
</style>
