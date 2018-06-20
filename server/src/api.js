const utils = require('./utils')
let Logger = require('log4js').getLogger()
const config = require('./config')
const http = require('http')
const https = require('https')
const fs = require('fs')
const md5 = require('md5')

// 日志等级
Logger.level = 'all'

// 获取当前的项目目录
const cwd = process.cwd()

module.exports = {
    init: function (apiRoutes) {
        // 强制下载
        apiRoutes.get('/download/:imgName', function (req, res) {
            const imgName = req.params.imgName
            if (!imgName) {
                // 提示出错
                res.status(404).json({
                    code: 2,
                    msg: '文件不存在'
                })
            }
            res.download(`${cwd}/${config.savepath}/${imgName}`, imgName)
        })

        // 获取图片的接口
        apiRoutes.get('/img/:imgName', function (req, res) {
            const imgName = req.params.imgName
            if (!imgName) {
                res.status(404).json({
                    code: 2,
                    msg: '文件不存在'
                })
            }
            const options = {
                root: `${cwd}/${config.savepath}/`,
                headers: {
                    'x-timestamp': Date.now(),
                    'x-sent': true
                }
            }
            res.sendFile(`${imgName}`, options)
        })

        // 文件上传接口定义
        apiRoutes.post('/upload', utils.upload.single('guetzli'), function (req, res) {
            let uploadFile = req.file
            Logger.info(uploadFile)
            if (uploadFile.size === 0) {
                res.json({
                    code: 1,
                    msg: '内容为空'
                })
                return
            }

            // 执行处理逻辑
            utils.execGuetzli(uploadFile.filename, `_${uploadFile.filename}`)

            // 结果返回
            res.json({
                code: 0,
                msg: '成功',
                dealedFile: `_${uploadFile.filename}`
            })
        })

        // 接收一个图片的url
        apiRoutes.post('/imgurl', function (req, res) {
            Logger.info(req.body.imgUrl)

            let imgUrl = req.body.imgUrl

            let result = {}

            const dateTime = new Date().getTime()

            let postfix = utils.getFilePostfix(imgUrl)
            let fileName = `${cwd}/${config.savepath}/${config.filePrefix}-${dateTime}-${md5(dateTime)}.${postfix || 'jpg'}`

            let request = imgUrl.startsWith('https') ? https : http

            request.get(imgUrl, (res) => {
                let imgData = ''
                res.setEncoding('binary')
                res.on('data', (chunk) => {
                    imgData += chunk
                })

                res.on('end', () => {
                    fs.writeFileSync(fileName, imgData, 'binary', (err) => {
                        if (err) {
                            result.code = 2
                            result.msg = '下载文件出错'
                            Logger.error('download error: %s', imgUrl)
                        } else {
                            result.code = 0
                            result.msg = '文件下载成功'
                            result.filename = fileName
                        }
                    })
                })
            })

            res.json(result)
        })
    }
}