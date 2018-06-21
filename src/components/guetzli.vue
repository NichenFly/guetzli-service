<template>
    <div class="container">
        <div class="img-container">
            <div class="upload-area">
                <!-- <input type="file" class="upload"> -->
                <vue-file-upload
                    label="上传"
                    :url="url"
                    :filters="filters"
                    :events="cbEvents"
                    :request-options="reqopts"
                    @onAdd="onAddItem"
                    :autoUpload="true"
                    name="guetzli"
                    ref="vueFileUploader"></vue-file-upload>
            </div>
            <!-- <div class="input-area">
                <input type="text" class="input"  v-model.trim="imgUrl" @keyup.enter="submit" placeholder="在此处粘贴图片地址(暂不支持)">
            </div> -->
        </div>
        <div class="loading" v-if="loading.status">
            <Loading :title="loading.title"></Loading>
        </div>
        <div class="show-container">
            <div class="record" v-for="(file, index) in uploadedFiles" :key="index">
                <div class="left-area">
                    <div class="img-info">
                        <span>原图片大小: {{file.origin.size}}</span>
                    </div>
                    <div class="img">
                        <img :src="file.origin.url">
                    </div>
                </div>
                <div class="right-area">
                    <div class="img-info">
                        <span>处理后图片大小: {{file.dealed.size}}</span>
                        <span>压缩比: {{file.rate}}%</span>
                        <span>
                            <a :href="file.dealed.download">下载</a>
                        </span>
                    </div>
                    <div class="img">
                        <img :src="file.dealed.url">
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import VueFileUpload from 'vue-file-upload'
    import Loading from './Loading'
    import axios from 'axios'
    import { PROCESS_STATUS } from '@/constants/constants'

    export default {
        data() {
            return {
                loading: {
                    status: false,
                    title: ''
                },
                imgUrl: '',
                files: [],
                uploadedFiles: [],
                // 文件过滤器，只能上传图片
                filters: [
                    {
                        name: 'imageFilter',
                        fn(file) {
                            var type = '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|'
                            return '|jpg|png|jpeg|'.indexOf(type) !== -1
                        }
                    }
                ],
                // 回调函数绑定
                cbEvents: {
                    onProgressUpload: (file, progress) => {
                        this.loading.status = true
                        this.loading.title = '正在上传...'
                    },
                    onCompleteUpload: (file, response, status, header) => {
                        if (response.code === 0) {
                            this.loading.title = '正在处理...'
                            this.$socket.emit('register', response.dealedFile)
                        } else {
                            this.loading.status = false
                            this.loading.title = ''
                        }
                    }
                },
                // xhr请求附带参数
                reqopts: {
                    formData: {
                        guetzli: 'guetzli'
                    },
                    responseType: 'json',
                    withCredentials: false
                }
            }
        },
        created() {
            this.url = '/api/upload'
        },
        sockets: {
            // socket相关
            status: function(res) {
                if (res.status === PROCESS_STATUS.DONE || res.status === PROCESS_STATUS.ERROR) {
                    if (res.status === PROCESS_STATUS.DONE) {
                        let fileInfo = res.msg
                        fileInfo.origin.url = `/api/img/${fileInfo.origin.filename}`
                        fileInfo.dealed.url = `/api/img/${fileInfo.dealed.filename}`
                        fileInfo.dealed.download = `/api/download/${fileInfo.dealed.filename}`
                        this.uploadedFiles.push(fileInfo)
                    }
                    this.loading.status = false
                }
            }
        },
        methods: {
            submit() {
                axios.post('/api/imgurl', {
                    imgUrl: this.imgUrl
                }).then((response) => {
                    console.log(response.data)
                }).catch(function (error) {
                    console.log(error)
                })
            },
            onStatus(file) {
                if (file.isSuccess) {
                    return '上传成功'
                } else if (file.isError) {
                    return '上传失败'
                } else if (file.isUploading) {
                    return '正在上传'
                } else {
                    return '待上传'
                }
            },
            onAddItem(files) {
                this.files = files
            },
            uploadItem(file) {
                // 单个文件上传
                file.upload()
            },
            uploadAll() {
                // 上传所有文件
                this.$refs.vueFileUploader.uploadAll()
            },
            clearAll() {
                // 清空所有文件
                this.$refs.vueFileUploader.clearAll()
            }
        },
        components: {
            Loading,
            VueFileUpload
        }
    }
</script>
<style lang="scss" scoped type="stylesheet/scss">
    $boxSize: 400px;
    $boxInfoHeight: 30px;
    .container {
        & > .img-container {
            background-color: #ccc;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 0 260px;

            & > .upload-area {
                padding: 20px;
                height: 40px;

                & > .fileupload-button {
                    padding: 10 20px;
                    background-color: #fff;
                    color: #2c3e50;
                    font-size: 20px;
                }
            }
            
            & > .input-area {
                padding: 10px;
                display: flex;
                flex-grow: 1;

                & > .input {
                    font-size: 16px;
                    padding: 10px;
                    outline: none;
                    text-indent: 10px;
                    border: 1px solid #ccc;
                    width: 100%;
                    border-radius: 3px;
                }
                & > .input:focus {
                    border: 1px solid #2c3e50;
                }
            }
        }

        .show-container {
            display: block;
            padding: 30px;
            & > .record {
                display: flex;
                flex-wrap: nowrap;
                justify-content: center;
                align-items: center;

                & > .left-area, & > .right-area {
                    display: flex;
                    flex-wrap: nowrap;
                    flex-direction: column;
                    // height: 300px;
                    width: $boxSize;
                    background-color: beige;
                    margin: 10px;
                    justify-content: flex-start;
                    align-items: flex-start;

                    & > .img, & > .img-info {
                        width: $boxSize;
                    }

                    & > .img {
                        // height: $boxSize;
                        // background-color: aqua;

                        display: flex;
                        justify-content: space-around;
                        align-items: flex-start;

                        img {
                            max-width: $boxSize;
                            max-height: $boxSize;
                        }
                    }
                    & > .img-info {
                        display: flex;
                        justify-content: space-around;
                        align-items: center;
                        height: $boxInfoHeight;
                        color: #777;
                        background-color: antiquewhite;
                    }
                }
            }
        }
    }
    
</style>
