<template>
  <div class="greetings">
    <h1 class="title">欢迎来到Airbus！</h1>
    <h3>
      <span>这是一个包含</span>
      <a href="https://vite.dev/" target="_blank" rel="noopener">Vite</a> +
      <a href="https://vuejs.org/" target="_blank" rel="noopener">Vue 3</a> +
      <a href="https://vuetifyjs.com/" target="_blank" rel="noopener">Vuetify</a> +
      <a href="https://developers.cloudflare.com/workers/" target="_blank" rel="noopener">Cloudflare Workers</a>
      <span>的项目。</span>
    </h3>
  </div>
</template>

<style scoped>
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  font-weight: normal;
}

.greetings {
  line-height: 1.6;
  font-size: 15px;
  text-rendering: optimizeLegibility;
  color: light-dark(#2c3e50, rgba(235, 235, 235, 0.64));
}

h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

.greetings h1,
.greetings h3 {
  text-align: center;
}

a,
.title {
  text-decoration: none;
  color: rgb(var(--v-theme-primary));
  transition: 0.4s;
  padding: 3px;
}
</style>
