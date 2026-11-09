<template>
  <footer class="footer">
    <div class="container footer__inner">
      <p class="footer__copy">© {{ new Date().getFullYear() }} SimpleStore — демонстрационный магазин</p>
      <p class="footer__note">Данные и оплата обрабатываются тестовым API</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  border-top: 1px solid var(--c-border);
  background: var(--c-surface);
}

.footer__inner {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding-top: 20px;
  padding-bottom: 20px;
  font-size: 13px;
  color: var(--c-text-muted);
}

@media (max-width: 640px) {
  .footer__inner {
    flex-direction: column;
    gap: 4px;
  }
}
</style>
