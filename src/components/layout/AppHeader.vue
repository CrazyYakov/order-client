<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/stores/auth'
import { useCart } from '@/stores/cart'

const router = useRouter()
const route = useRoute()
const { isAuthenticated, state: authState, logout } = useAuth()
const { count, clear } = useCart()

const search = computed({
  get: () => (typeof route.query.search === 'string' ? route.query.search : ''),
  set: (value: string) => {
    if (route.name === 'catalog') {
      router.replace({ name: 'catalog', query: { ...route.query, search: value || undefined } })
    }
  },
})

function submitSearch(): void {
  router.push({ name: 'catalog', query: { search: search.value || undefined } })
}

function handleLogout(): void {
  logout()
  clear()
  if (route.meta.requiresAuth) {
    void router.push({ name: 'catalog' })
  }
}
</script>

<template>
  <header class="header">
    <div class="container header__inner">
      <RouterLink :to="{ name: 'catalog' }" class="brand">
        <span class="brand__mark" aria-hidden="true">S</span>
        <span class="brand__name">SimpleStore</span>
      </RouterLink>

      <form class="search" role="search" @submit.prevent="submitSearch">
        <label class="visually-hidden" for="global-search">Поиск товаров</label>
        <input
          id="global-search"
          v-model="search"
          class="search__input"
          type="search"
          placeholder="Поиск товаров…"
          autocomplete="off"
        />
        <button class="search__button" type="submit" aria-label="Найти">Найти</button>
      </form>

      <nav class="nav">
        <RouterLink
          v-if="isAuthenticated"
          :to="{ name: 'orders' }"
          class="nav__link"
          active-class="nav__link--active"
        >
          Заказы
        </RouterLink>

        <RouterLink :to="{ name: 'cart' }" class="nav__link nav__link--cart">
          Корзина
          <span v-if="count > 0" class="nav__badge">{{ count }}</span>
        </RouterLink>

        <template v-if="isAuthenticated">
          <span class="nav__user" :title="`ID пользователя: ${authState.userId}`">
            #{{ authState.userId }}
          </span>
          <button class="nav__link nav__link--button" type="button" @click="handleLogout">
            Выйти
          </button>
        </template>
        <template v-else>
          <RouterLink :to="{ name: 'login' }" class="nav__link">Войти</RouterLink>
          <RouterLink :to="{ name: 'register' }" class="nav__cta">Регистрация</RouterLink>
        </template>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--c-border);
}

.header__inner {
  display: flex;
  align-items: center;
  gap: 20px;
  height: var(--header-height);
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--c-text);
  font-weight: 700;
  font-size: 17px;
  flex-shrink: 0;
}

.brand:hover {
  color: var(--c-text);
}

.brand__mark {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 9px;
  background: var(--c-accent);
  color: #fff;
  font-size: 16px;
}

.search {
  display: flex;
  flex: 1;
  max-width: 460px;
  border: 1px solid var(--c-border-strong);
  border-radius: 999px;
  overflow: hidden;
  background: var(--c-surface);
}

.search:focus-within {
  border-color: var(--c-accent);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
}

.search__input {
  flex: 1;
  border: none;
  padding: 9px 16px;
  background: transparent;
  min-width: 0;
}

.search__input:focus {
  outline: none;
}

.search__button {
  border: none;
  background: transparent;
  padding: 0 16px;
  font-weight: 600;
  font-size: 13.5px;
  color: var(--c-accent);
}

.nav {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
}

.nav__link {
  padding: 7px 11px;
  border-radius: var(--radius-sm);
  color: var(--c-text-muted);
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
}

.nav__link:hover {
  background: var(--c-surface-2);
  color: var(--c-text);
}

.nav__link--active {
  color: var(--c-accent);
  background: var(--c-accent-soft);
}

.nav__link--button {
  border: none;
  background: transparent;
}

.nav__link--cart {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.nav__badge {
  display: grid;
  place-items: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  background: var(--c-accent);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
}

.nav__user {
  font-size: 13px;
  color: var(--c-text-muted);
  font-variant-numeric: tabular-nums;
}

.nav__cta {
  padding: 8px 14px;
  border-radius: var(--radius-sm);
  background: var(--c-accent);
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
}

.nav__cta:hover {
  background: var(--c-accent-hover);
  color: #fff;
}

@media (max-width: 900px) {
  .header__inner {
    flex-wrap: wrap;
    height: auto;
    padding-top: 12px;
    padding-bottom: 12px;
    gap: 12px;
  }

  .search {
    order: 3;
    max-width: none;
    flex-basis: 100%;
  }

  .nav {
    margin-left: auto;
  }
}

@media (max-width: 560px) {
  .brand__name {
    display: none;
  }

  .nav__user {
    display: none;
  }
}
</style>
