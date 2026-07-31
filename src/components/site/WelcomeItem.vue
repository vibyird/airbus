<template>
  <div class="item">
    <i>
      <slot name="icon"></slot>
    </i>
    <div class="details">
      <h3>
        <slot name="heading"></slot>
      </h3>
      <slot></slot>
    </div>
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

.item {
  margin-top: 2rem;
  display: flex;
  position: relative;
  line-height: 1.6;
  font-size: 15px;
  text-rendering: optimizeLegibility;
  color: light-dark(#2c3e50, rgba(235, 235, 235, 0.64));
}

.details {
  flex: 1;
  margin-left: 1rem;
}

i {
  display: flex;
  place-items: center;
  place-content: center;
  width: 32px;
  height: 32px;

  color: light-dark(#2c3e50, rgba(235, 235, 235, 0.64));
}

h3 {
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 0.4rem;
  color: light-dark(#2c3e50, #ffffff);
}
</style>
