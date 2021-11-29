<template>
  <div id="app">
    <!-- <img alt="Vue logo" src="./assets/logo.png"> -->
    <!-- <HelloWorld msg="Welcome to Your Vue.js App"/> -->
    <!-- <sample></sample> -->
    <flow-chart/>
  </div>
</template>

<script>
import FlowChart from './components/FlowChart.vue'
import HelloWorld from './components/HelloWorld.vue'
import sample from './components/sample.vue'

export default {
  name: 'App',
  components: {
    FlowChart,
    HelloWorld,
    sample
  },
}
</script>

<style>
/* #app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
} */
</style>
