<template>
  <div id="app">
    <!-- <img src="./assets/logo.png"> -->
    <div class="title">
        <h1>Guetzli 图片无损压缩,支持JPG,PNG格式</h1>
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
    name: 'app'
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
