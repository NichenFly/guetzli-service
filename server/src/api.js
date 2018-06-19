const fs = require('fs')
const utils = require('./utils')
let Logger = require('log4js').getLogger()

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
            res.download(`${cwd}/files/${imgName}`, imgName)
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
                root: `${cwd}/files/`,
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

            const filepath = uploadFile.path
            const dealedFilepath = `${uploadFile.destination}/_${uploadFile.filename}`
            const execResult = utils.execGuetzli(filepath, dealedFilepath)
            if (execResult.code !== 0) {
                res.json(execResult)
                return
            }

            let fileInfo = fs.statSync(filepath)
            let dealedFileInfo = fs.statSync(dealedFilepath)

            // 信息状态返回
            const filename = uploadFile.filename
            const fileSize = fileInfo.size
            const dealedSize = dealedFileInfo.size

            let info = {
                origin: {
                    filename: `${filename}`,
                    size: `${parseInt(fileSize / 1000)}KB`
                },
                dealed: {
                    filename: `_${filename}`,
                    size: `${parseInt(dealedSize / 1000)}KB`
                },
                rate: ((fileSize - dealedSize) / fileSize * 100).toFixed(2)
            }
            Logger.info('原图大小: %s', info.origin.size)
            Logger.info('压缩后大小: %s', info.dealed.size)
            Logger.info('压缩比例: %s%', info.rate)

            // 结果返回
            res.json({
                code: 0,
                msg: '成功',
                info: info
            })
        })

        // 接收一个图片的url
        apiRoutes.post('/imgurl', function (req, res) {
            Logger.info(req.body.imgUrl)
            let result = {
                code: 200,
                msg: '成功',
                info: {
                    file: req.body.imgUrl
                }
            }

            res.json(result)
        })
    }
}