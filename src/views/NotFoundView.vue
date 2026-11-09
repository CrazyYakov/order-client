<script setup lang="ts">
import { RouterLink } from 'vue-router'
import EmptyState from '@/components/ui/EmptyState.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
</script>

<template>
  <EmptyState
    icon="🧭"
    title="Страница не найдена"
    description="Похоже, такой страницы нет. Проверьте адрес или вернитесь в каталог."
  >
    <RouterLink :to="{ name: 'catalog' }">
      <BaseButton>В каталог</BaseButton>
    </RouterLink>
  </EmptyState>
</template>
