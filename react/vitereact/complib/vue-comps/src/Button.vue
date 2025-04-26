
<template>
  <button @click="onClick" class="my-button">
    <slot></slot>
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'Button',
  emits: ['click'],
  setup(_, { emit }) {
    const onClick = () => emit('click')
    return { onClick }
  }
})
</script>

<style scoped>
.my-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  cursor: pointer;
}
</style>