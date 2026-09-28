<template>
  <div>
    <RouterLink to="/"></RouterLink>
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
</script>
