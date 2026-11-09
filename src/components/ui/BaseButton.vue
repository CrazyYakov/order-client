<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    size?: 'md' | 'sm'
    type?: 'button' | 'submit'
    disabled?: boolean
    loading?: boolean
    block?: boolean
  }>(),
  {
    variant: 'primary',
    size: 'md',
    type: 'button',
    disabled: false,
    loading: false,
    block: false,
  },
)
</script>

<template>
  <button
    :type="type"
    class="btn"
    :class="[`btn--${variant}`, `btn--${size}`, { 'btn--block': block }]"
    :disabled="disabled || loading"
  >
    <span v-if="loading" class="btn__spinner" aria-hidden="true" />
    <slot />
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  font-weight: 600;
  white-space: nowrap;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease,
    box-shadow 0.15s ease;
}

.btn--md {
  padding: 10px 18px;
  font-size: 15px;
}

.btn--sm {
  padding: 6px 12px;
  font-size: 13px;
}

.btn--block {
  width: 100%;
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.btn--primary {
  background: var(--c-accent);
  color: var(--c-text-inverse);
  box-shadow: var(--shadow-sm);
}

.btn--primary:not(:disabled):hover {
  background: var(--c-accent-hover);
}

.btn--secondary {
  background: var(--c-surface);
  border-color: var(--c-border-strong);
  color: var(--c-text);
}

.btn--secondary:not(:disabled):hover {
  background: var(--c-surface-2);
}

.btn--ghost {
  background: transparent;
  color: var(--c-text-muted);
}

.btn--ghost:not(:disabled):hover {
  background: var(--c-surface-2);
  color: var(--c-text);
}

.btn--danger {
  background: var(--c-danger-soft);
  color: var(--c-danger);
}

.btn--danger:not(:disabled):hover {
  background: #fadada;
}

.btn__spinner {
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
