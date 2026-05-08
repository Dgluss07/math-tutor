<template>
  <div class="app">
    <header class="header">
      <div class="header-inner">
        <span class="header-icon">∑</span>
        <span class="header-title">Math Tutor</span>
      </div>
    </header>

    <main class="messages" ref="messagesRef">
      <div v-if="messages.length === 0" class="empty-state">
        <div class="empty-icon">∑</div>
        <h1>Math Tutor</h1>
        <p>Ask me any math question and I'll walk you through the solution.</p>
      </div>

      <div
        v-for="(msg, i) in messages"
        :key="i"
        :class="['message-row', msg.role]"
      >
        <div v-if="msg.role === 'assistant'" class="avatar">M</div>
        <div class="bubble">{{ msg.content }}</div>
      </div>

      <div v-if="loading" class="message-row assistant">
        <div class="avatar">M</div>
        <div class="bubble dots">
          <span></span><span></span><span></span>
        </div>
      </div>
    </main>

    <footer class="input-area">
      <div class="input-box">
        <textarea
          ref="textareaRef"
          v-model="input"
          @keydown.enter.exact.prevent="send"
          @input="autoResize"
          placeholder="Ask a math question…"
          rows="1"
          :disabled="loading"
        ></textarea>
        <button
          class="send-btn"
          @click="send"
          :disabled="!input.trim() || loading"
          aria-label="Send"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="19" x2="12" y2="5"/>
            <polyline points="5 12 12 5 19 12"/>
          </svg>
        </button>
      </div>
      <p v-if="error" class="error-msg">{{ error }}</p>
      <p class="hint">Enter to send · Shift+Enter for new line</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue';

const messages = ref([]);
const input = ref('');
const loading = ref(false);
const error = ref('');
const messagesRef = ref(null);
const textareaRef = ref(null);

function autoResize() {
  const ta = textareaRef.value;
  if (!ta) return;
  ta.style.height = 'auto';
  ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
}

function scrollToBottom() {
  nextTick(() => {
    const el = messagesRef.value;
    if (el) el.scrollTop = el.scrollHeight;
  });
}

async function send() {
  const text = input.value.trim();
  if (!text || loading.value) return;

  error.value = '';
  messages.value.push({ role: 'user', content: text });
  input.value = '';

  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto';
  }

  scrollToBottom();
  loading.value = true;

  try {
    const res = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: messages.value }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Server error');
    }

    const data = await res.json();
    messages.value.push({ role: 'assistant', content: data.content });
  } catch (err) {
    error.value = err.message;
    messages.value.pop();
  } finally {
    loading.value = false;
    scrollToBottom();
  }
}
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #212121;
  color: #ececec;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* ── Header ── */
.header {
  flex-shrink: 0;
  border-bottom: 1px solid #2f2f2f;
  padding: 0 1rem;
  height: 56px;
  display: flex;
  align-items: center;
}

.header-inner {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1rem;
  font-weight: 600;
  color: #ececec;
}

.header-icon {
  font-size: 1.4rem;
  color: #a97cf8;
}

/* ── Messages ── */
.messages {
  flex: 1;
  overflow-y: auto;
  padding: 2rem 1rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.messages::-webkit-scrollbar { width: 6px; }
.messages::-webkit-scrollbar-track { background: transparent; }
.messages::-webkit-scrollbar-thumb { background: #3f3f3f; border-radius: 3px; }

/* ── Empty State ── */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 0.75rem;
  color: #8e8ea0;
  padding-bottom: 5rem;
}

.empty-icon {
  font-size: 3rem;
  color: #a97cf8;
  line-height: 1;
}

.empty-state h1 {
  font-size: 1.75rem;
  font-weight: 600;
  color: #ececec;
  margin: 0;
}

.empty-state p {
  font-size: 0.95rem;
  margin: 0;
  max-width: 360px;
}

/* ── Message Row ── */
.message-row {
  display: flex;
  gap: 12px;
  max-width: 768px;
  width: 100%;
  margin: 0 auto;
}

.message-row.user {
  flex-direction: row-reverse;
}

.avatar {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #a97cf8;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  margin-top: 2px;
}

.bubble {
  padding: 0.7rem 1rem;
  border-radius: 1rem;
  font-size: 0.95rem;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.message-row.user .bubble {
  background: #2f2f2f;
  border-bottom-right-radius: 4px;
  max-width: 75%;
}

.message-row.assistant .bubble {
  background: transparent;
  padding-left: 0;
  flex: 1;
}

/* ── Loading Dots ── */
.dots {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0.6rem 0 !important;
}

.dots span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #8e8ea0;
  animation: pulse 1.2s ease-in-out infinite;
}

.dots span:nth-child(2) { animation-delay: 0.2s; }
.dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes pulse {
  0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1); }
}

/* ── Input Area ── */
.input-area {
  flex-shrink: 0;
  padding: 0.75rem 1rem 1.25rem;
  background: #212121;
}

.input-box {
  max-width: 768px;
  margin: 0 auto;
  display: flex;
  align-items: flex-end;
  gap: 8px;
  background: #2f2f2f;
  border: 1px solid #3f3f3f;
  border-radius: 1rem;
  padding: 0.6rem 0.6rem 0.6rem 1rem;
  transition: border-color 0.15s;
}

.input-box:focus-within {
  border-color: #6e6e80;
}

.input-box textarea {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #ececec;
  font-size: 0.95rem;
  line-height: 1.5;
  resize: none;
  max-height: 160px;
  overflow-y: auto;
  font-family: inherit;
}

.input-box textarea::placeholder { color: #6e6e80; }
.input-box textarea:disabled { opacity: 0.5; cursor: not-allowed; }

.send-btn {
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  border-radius: 0.5rem;
  border: none;
  background: #ececec;
  color: #212121;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s, opacity 0.15s;
}

.send-btn:hover:not(:disabled) { background: #fff; }
.send-btn:disabled { opacity: 0.3; cursor: not-allowed; }

.error-msg {
  max-width: 768px;
  margin: 0.4rem auto 0;
  font-size: 0.8rem;
  color: #f87171;
}

.hint {
  max-width: 768px;
  margin: 0.4rem auto 0;
  font-size: 0.75rem;
  color: #4a4a5a;
  text-align: center;
}
</style>
