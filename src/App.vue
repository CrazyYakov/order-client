<script setup lang="ts">
import { onBeforeUnmount, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import ToastHost from '@/components/ui/ToastHost.vue'
import { AUTH_EXPIRED_EVENT } from '@/api/client'
import { useAuth } from '@/stores/auth'
import { useCart } from '@/stores/cart'
import { useToasts } from '@/stores/toast'

const route = useRoute()
const router = useRouter()
const { isAuthenticated } = useAuth()
const cart = useCart()
const toasts = useToasts()

function onAuthExpired(): void {
  cart.clear()
  toasts.error('Сессия истекла, войдите заново')
  if (route.meta.requiresAuth) {
    void router.push({ name: 'login', query: { redirect: route.fullPath } })
  }
}

onMounted(() => {
  window.addEventListener(AUTH_EXPIRED_EVENT, onAuthExpired)
  if (isAuthenticated.value) void cart.load().catch(() => undefined)
})

onBeforeUnmount(() => {
  window.removeEventListener(AUTH_EXPIRED_EVENT, onAuthExpired)
})

watch(isAuthenticated, (value) => {
  if (value) void cart.load().catch(() => undefined)
  else cart.clear()
})

watch(
  () => route.name,
  () => {
    if (isAuthenticated.value && cart.state.items.length === 0) {
      void cart.load().catch(() => undefined)
    }
  },
)
</script>

<template>
  <AppHeader />
  <main class="page">
    <div class="container">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </div>
  </main>
  <AppFooter />
  <ToastHost />
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.16s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
