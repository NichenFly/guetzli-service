var Logger = require('log4js').getLogger()
const shelljs = require('shelljs')
var multer = require('multer')
var md5 = require('md5')

// 日志等级
Logger.level = 'all'

// 获取当前的项目目录
var cwd = process.cwd()

/**
 * 执行压缩逻辑
 * @param {*} originFileName 传入的文件
 * @param {*} savedFileName 处理后保存的文件
 */
function execGuetzli(filepath, dealedFilepath) {
    let result = {}
    try {
        const cmd = `guetzli --quality 84 ${filepath} ${dealedFilepath}`

        Logger.info('执行命令: ', `guetzli ${cmd}`)

        Logger.info('执行中...')

        // 执行压缩程序
        const execChildInfo = shelljs.exec(cmd, { silent: true })
        if (execChildInfo.code !== 0) {
            result.msg = execChildInfo.stderr
            Logger.error('执行命令出错: %s', execChildInfo.stderr)
            Logger.error('执行出错文件: %s', filepath)
        }
        result.code = execChildInfo.code
        Logger.info('执行结束...')
    } catch (err) {
        Logger.error('执行命令出错: ', err)
        Logger.error('执行出错文件: %s', filepath)
        result.code = result.code ? 3 : result.code
        result.msg = err
    }
    return result
}

let storage = multer.diskStorage({
    destination: `${cwd}/files`,
    filename: function (req, file, cb) {
        var fileFormat = (file.originalname).split('.')
        cb(null, `guetzli-${new Date().getTime()}-${md5(file)}.${fileFormat[fileFormat.length - 1]}`)
    }
})
var upload = multer({
    storage: storage
    // limits:{}
    // fileFilter() {}
})

module.exports = {
    execGuetzli: execGuetzli,
    upload: upload
}