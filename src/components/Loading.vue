<template>
  <div class="loading">
    <img src="static/loading.gif">
    <p class="desc">{{title}}</p>
  </div>
</template>
<script>
    export default {
        props: {
            title: {
                type: String,
                default: '上传中...'
            }
        }
    }
</script>
<style scoped>
.loading {
    width: 100%;
    text-align: center;
}
.desc {
    line-height: 20px;
    font-size: 20px;
    color: #ccc;
}
</style>
