<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <button @click="incrementQkm" class="qkbutton">qianun msg {{ qkmValue }}</button>
    <HelloWorld msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
import HelloWorld from '@/components/HelloWorld.vue'
import microActions from '@/microActions';

export default {
  name: 'HomeView',
  components: {
    HelloWorld
  },
  data() {
    return {
      qkmValue: 0 
    }
  },
  methods: {
    incrementQkm() {
      this.qkmValue += 1;
      microActions.setGlobalState?.({
        qkm: this.qkmValue
      });
    }
  },
  mounted() {
    microActions.onGlobalStateChange?.((newState, prevState) => {
      console.log('mainApp', newState, prevState);
      this.qkmValue = newState.qkm;
    });
  }
}
</script>

<style lang="css" scoped>
.qkbutton{
  border: 1px solid gray;
  background-color: #0068EB;
  box-shadow: 1px 1px 1px #0000f0;
  border-radius: 5px;
  /* width: 40px; */
  padding: 6px;
  color:white;
  cursor: pointer;
}
</style>
