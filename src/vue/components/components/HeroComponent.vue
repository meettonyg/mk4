<template>
  <div class="hero-component">
    <h1 class="hero-title">{{ title || 'Welcome' }}</h1>
    <p class="hero-subtitle">{{ subtitle || 'Professional Media Kit' }}</p>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  subtitle: String
});
</script>

<style scoped>
.hero-component {
  padding: 60px 20px;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
}

.hero-title {
  margin: 0 0 12px;
  font-size: 36px;
  font-weight: bold;
}

.hero-subtitle {
  margin: 0;
  font-size: 18px;
  opacity: 0.9;
}
</style>
