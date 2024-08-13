<template>
    <NuxtLayout name="default"> 
      <NuxtPage />
    </NuxtLayout>
  </template>
  
  <script setup>
import { onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();

onMounted(() => {
  authStore.initCsrfToken();
});
</script>