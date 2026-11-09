<script setup lang="ts">
import { useToasts } from '@/stores/toast'

const { state, dismiss } = useToasts()
</script>

<template>
  <div class="toasts" role="status" aria-live="polite">
    <TransitionGroup name="toast">
      <div
        v-for="toast in state.items"
        :key="toast.id"
        class="toast"
        :class="`toast--${toast.kind}`"
      >
        <span class="toast__text">{{ toast.text }}</span>
        <button class="toast__close" type="button" aria-label="Закрыть" @click="dismiss(toast.id)">
          ×
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toasts {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: min(360px, calc(100vw - 40px));
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border-radius: var(--radius-md);
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  box-shadow: var(--shadow-md);
  font-size: 14px;
}

.toast--success {
  border-left: 4px solid var(--c-success);
}

.toast--error {
  border-left: 4px solid var(--c-danger);
}

.toast--info {
  border-left: 4px solid var(--c-accent);
}

.toast__text {
  flex: 1;
}

.toast__close {
  border: none;
  background: transparent;
  color: var(--c-text-muted);
  font-size: 18px;
  line-height: 1;
  padding: 0 2px;
}

.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
