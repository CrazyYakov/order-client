import { reactive } from 'vue'

export type ToastKind = 'success' | 'error' | 'info'

export interface Toast {
  id: number
  kind: ToastKind
  text: string
}

const state = reactive<{ items: Toast[] }>({ items: [] })

let nextId = 1

function push(kind: ToastKind, text: string, ttl = 3500): void {
  const id = nextId++
  state.items.push({ id, kind, text })
  window.setTimeout(() => dismiss(id), ttl)
}

function dismiss(id: number): void {
  state.items = state.items.filter((item) => item.id !== id)
}

export function useToasts() {
  return {
    state,
    dismiss,
    success: (text: string) => push('success', text),
    error: (text: string) => push('error', text, 5000),
    info: (text: string) => push('info', text),
  }
}
