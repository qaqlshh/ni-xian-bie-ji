<script setup>
import { ref } from 'vue'
import TranslatorForm from './components/TranslatorForm.vue'

const notice = ref('')
let noticeTimer

function handlePreview() {
  notice.value = 'AI 还在路上。你先别急。'
  window.clearTimeout(noticeTimer)
  noticeTimer = window.setTimeout(() => {
    notice.value = ''
  }, 2600)
}
</script>

<template>
  <div class="site-shell">
    <header class="topbar">
      <a class="brand" href="#" aria-label="你先别急首页">
        <span class="brand-mark" aria-hidden="true">急</span>
        <span>你先别急</span>
      </a>
      <span class="build-badge"><i></i> 正在长出来</span>
    </header>

    <main>
      <section class="hero-section">
        <div class="hero-copy">
          <p class="eyebrow">急急翻译器 / BEFORE YOU SEND</p>
          <h1>
            这句话，<br />
            <span>你先别急着发。</span>
          </h1>
          <p class="hero-description">
            想骂人，但是钱还没结。<br />
            火气可以留，话换一种说法。
          </p>

          <div class="example-bubble" aria-label="翻译示例">
            <span class="bubble-label">比如</span>
            <p>“你们是不是一天一个想法？”</p>
            <span class="bubble-arrow">↓</span>
            <p class="bubble-result">“这次调整和昨天确认的方向不太一致，麻烦先统一一下。”</p>
          </div>
        </div>

        <TranslatorForm @preview="handlePreview" />
      </section>
    </main>

    <footer>
      <span>输入内容不会保存</span>
      <span class="footer-dot">·</span>
      <a href="https://spicytater.cn/community/ideas?ideaId=41ecd346-32ac-4a08-8505-97ea0e17553c">在程序员副业围观这个 Vibe</a>
    </footer>

    <Transition name="notice">
      <div v-if="notice" class="notice" role="status">{{ notice }}</div>
    </Transition>
  </div>
</template>
