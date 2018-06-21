let Logger = require('log4js').getLogger()
const shelljs = require('shelljs')
const multer = require('multer')
const md5 = require('md5')
const fs = require('fs')
const config = require('./config')
const socket = require('./socket')
const path = require('path')
require('./constants')

// 日志等级
Logger.level = 'all'

// 存储已经执行的文件处理任务
let processResults = global.processResults || {}
const PROCESS_STATUS = global.PROCESS_STATUS

// 获取当前的项目目录
const cwd = process.cwd()
const saveFilepath = path.join(cwd, `../${config.savepath}`)

/**
 * 异步执行压缩逻辑, 把处理结果写入处理队列
 * @param {*} originFileName 传入的文件
 * @param {*} savedFileName 处理后保存的文件
 */
function execGuetzli(file, dealedFile) {
    let obj = {
        status: PROCESS_STATUS.CREATE,
        msg: ''
    }
    processResults[dealedFile] = obj
    try {
        const cmd = `guetzli --quality 84 ${saveFilepath}/${file} ${saveFilepath}/${dealedFile}`

        Logger.info(`${file} - 执行命令中...`)

        // 执行压缩程序
        shelljs.exec(cmd, { silent: true, async: true }, (code, stdout, stderr) => {
            if (code === 0) {
                processResults[dealedFile].status = PROCESS_STATUS.DONE
                processResults[dealedFile].msg = getfileDiff(file, dealedFile)
            } else {
                processResults[dealedFile].status = PROCESS_STATUS.ERROR
                processResults[dealedFile].msg = stderr
                Logger.error(`${file} - 执行命令出错: %s`, stderr)
            }
            socket.emitFileInfo(dealedFile)
            Logger.info(`${file} - 执行结束...`)
        })
    } catch (err) {
        Logger.error(`${file} - 执行命令出错: %s`, err)
    }
}

function getfileDiff(origin, dealed) {
    let originFile = `${saveFilepath}/${origin}`
    let dealedFile = `${saveFilepath}/${dealed}`

    let fileInfo = fs.statSync(originFile)
    let dealedFileInfo = fs.statSync(dealedFile)

    // 信息状态返回
    const fileSize = fileInfo.size
    const dealedSize = dealedFileInfo.size

    let info = {
        origin: {
            filename: `${origin}`,
            size: `${parseInt(fileSize / 1000)}KB`
        },
        dealed: {
            filename: `${dealed}`,
            size: `${parseInt(dealedSize / 1000)}KB`
        },
        rate: ((fileSize - dealedSize) / fileSize * 100).toFixed(2)
    }
    return info
}

let storage = multer.diskStorage({
    destination: `${saveFilepath}`,
    filename: function (req, file, cb) {
        var fileFormat = (file.originalname).split('.')
        cb(null, `${config.filePrefix}-${new Date().getTime()}-${md5(file)}.${fileFormat[fileFormat.length - 1]}`)
    }
})
const upload = multer({
    storage: storage
    // limits:{}
    // fileFilter() {}
})

/**
 * 获取网络地址的后缀名
 * @param {string} imgUrl
 */
function getFilePostfix(imgUrl) {
    let fileName = imgUrl.substring(imgUrl.lastIndexOf('/') + 1)
    if (~fileName.indexOf('.')) {
        return fileName.substring(fileName.lastIndexOf('.') + 1)
    }
    return ''
}

module.exports = {
    execGuetzli,
    upload,
    getfileDiff,
    getFilePostfix
}