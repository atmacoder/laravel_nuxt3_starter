<template>
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-4">Dashboard</h1>
  
      <p v-if="authStore.isLoggedIn">
        Welcome, <span class="font-medium">{{ authStore.user.name }}</span>!
      </p>
  
      <p v-else>
        You are not logged in. Please <NuxtLink to="/login">log in</NuxtLink> to access the dashboard.
      </p>
    </div>
  </template>
  
  <script setup>
  import { useAuthStore } from '~/stores/auth' 
  
  const authStore = useAuthStore()
  </script>