<template>
    <div class="container">
        <div class="img-container">
            <div class="upload-area">
                <input type="file" class="upload">
                <vue-file-upload
                    label="本地上传"
                    :url="url"
                    :filters="filters"
                    :events="cbEvents"
                    :request-options="reqopts"
                    @onAdd="onAddItem"
                    :autoUpload="true"
                    name="guetzli"
                    ref="vueFileUploader"></vue-file-upload>
            </div>
            <div class="input-area">
                <input type="text" class="input"  v-model.trim="imgUrl" @keyup.enter="submit" placeholder="在此处粘贴图片地址(暂不支持)">
            </div>
        </div>
        <div class="show-container">
            <div class="record">
                <div class="left-area">
                    <div class="img">
                        <img src="">
                    </div>
                    <div class="img-info">
                        <table>
                            <tr>
                                <td>文件名: </td>
                                <td>阿萨达</td>
                            </tr>
                            <tr>
                                <td>文件大小: </td>
                                <td>100KB</td>
                            </tr>
                        </table>
                    </div>
                </div>
                <div class="right-area">
                    <div class="img-info">
                    </div>
                    <div class="img">
                        <img src="">
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import VueFileUpload from 'vue-file-upload'
    import axios from 'axios'

    export default {
        data() {
            return {
                imgUrl: '',
                files: [],
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
                    onCompleteUpload: (file, response, status, header) => {
                        console.log(file)
                        console.log('finish upload')
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
        methods: {
            submit() {
                axios.post('/api/imgurl', {
                    imgUrl: this.imgUrl
                }).then((response) => {
                    console.log(response)
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
                console.log(files)
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
            VueFileUpload
        }
    }
</script>
<style lang="scss" scoped type="stylesheet/scss">
    .container {
        & > .img-container {
            background-color: #ccc;
            display: flex;
            padding: 0 260px;

            & > .upload-area {
                padding: 20px;
                display: flex;
                height: 40px;

                & > .fileupload-button {
                    padding: 10px;
                    background-color: #fff;
                    color: #2c3e50;
                    font-size: 16px;
                }

                & > .upload {
                    display: none;
                }
            }
            
            & > .input-area {
                padding: 20px;
                display: flex;
                flex-grow: 1;

                & > .input {
                    outline: none;
                    text-indent: 10px;
                    border: 1px solid #ccc;
                    width: 100%;
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
                    height: 300px;
                    width: 500px;
                    background-color: aquamarine;
                    margin: 10px;

                    & > .img {
                        width: 300px;
                        height: 300px;
                        background-color: aqua;
                    }
                    & > .img-info {
                        width: 200px;
                        height: 300px;
                        color: #777;
                        background-color: antiquewhite;
                        table {
                            border-collapse: collapse;
                        }
                        tr {
                            border-bottom: solid rgb(165, 134, 116) 1px;
                        }
                        tr:last-child {
                            border-bottom: none;
                        }

                        tr > td:nth-child(1) {
                            text-align: right;
                        }
                        tr > td:nth-child(2) {
                            text-align: left;
                        }
                        td {
                            width: 100px;
                        }
                    }
                }
                & > .left-area {
                    justify-content: flex-end;
                    align-items: flex-start;
                }
                & > .right-area {
                    justify-content: flex-start;
                    align-items: flex-end;
                }
            }
        }
    }
    
</style>
