require('./check-versions')()

var config = require('../config')
if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = JSON.parse(config.dev.env.NODE_ENV)
}

var opn = require('opn')
var path = require('path')
var express = require('express')
var webpack = require('webpack')
var proxyMiddleware = require('http-proxy-middleware')
var webpackConfig = require('./webpack.dev.conf')

/////////////////// 文件上传引入的
var multer = require('multer')
var md5 = require('md5')

//获取异步步子进程的promise版本
var Logger = require('log4js').getLogger()
var bodyParser = require("body-parser")
const { spawn } = require('child_process')
const fs = require('fs')
const shelljs = require('shelljs')

//获取当前的项目目录
var cwd = process.cwd()

//日志等级
Logger.level = 'all'

///////////////////

// default port where dev server listens for incoming traffic
var port = process.env.PORT || config.dev.port

// automatically open browser, if not set will be false
var autoOpenBrowser = !!config.dev.autoOpenBrowser

// Define HTTP proxies to your custom API backend
// https://github.com/chimurai/http-proxy-middleware
var proxyTable = config.dev.proxyTable

var app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// upload a file
var apiRoutes = express.Router()
var storage = multer.diskStorage({
    destination: `${cwd}/files`,
    filename: function(req, file, cb) {
        var fileFormat = (file.originalname).split(".")
        cb(null, `guetzli-${new Date().getTime()}-${md5(file)}.${fileFormat[fileFormat.length - 1]}`)
    }
})
var upload = multer({
    storage: storage,
    // limits:{}
    // fileFilter() {}
});

/**
 * 执行压缩逻辑
 * @param {*} originFileName 传入的文件
 * @param {*} savedFileName 处理后保存的文件
 */
function execGuetzli(filepath, dealedFilepath) {
    try {
        const cmd = `guetzli --quality 84 ${filepath} ${dealedFilepath}`

        Logger.info('执行命令: ', `guetzli ${cmd}`)

        Logger.info('执行中...')

        // 执行压缩程序
        const execChildInfo = shelljs.exec(cmd, { silent: true })
        if (execChildInfo.code !== 0) {
            Logger.error('执行命令出错: %s', execChildInfo.stderr)
        }
        Logger.info('执行结束...')
    } catch(err) {
        Logger.error('执行命令出错: ', err)
    }
}

// 文件上传接口定义
apiRoutes.post('/upload', upload.single('guetzli'), function(req, res) {
    let uploadFile = req.file
    if (uploadFile.size === 0) {
        res.json({
            code: 1,
            msg: '内容为空'
        })
        return
    }

    const filepath = uploadFile.path
    const dealedFilepath = `${uploadFile.destination}/_${uploadFile.filename}`
    execGuetzli(filepath, dealedFilepath)

    let fileInfo = fs.statSync(filepath)
    let dealedFileInfo = fs.statSync(dealedFilepath)

    // 信息状态返回
    const filename = uploadFile.filename
    const fileSize = fileInfo.size
    const dealedSize = dealedFileInfo.size

    let result = {
        code: 200,
        msg: '成功',
        info: {
            file: {
                path: `files/${filename}`,
                size: `${parseInt(fileSize / 1024)}KB`
            },
            dealed: {
                path: `file/_${filename}`,
                size: `${parseInt(dealedSize / 1024)}KB`
            },
            rate: ((fileSize - dealedSize) / fileSize * 100).toFixed(2)
        }
    }
    res.json(result)
})

//接收一个图片的url
apiRoutes.post('/imgurl', function(req, res) {
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
app.use('/api', apiRoutes)

/////////////////////


var compiler = webpack(webpackConfig)

var devMiddleware = require('webpack-dev-middleware')(compiler, {
    publicPath: webpackConfig.output.publicPath,
    quiet: true
})

var hotMiddleware = require('webpack-hot-middleware')(compiler, {
        log: false,
        heartbeat: 2000
    })
    // force page reload when html-webpack-plugin template changes
compiler.plugin('compilation', function(compilation) {
    compilation.plugin('html-webpack-plugin-after-emit', function(data, cb) {
        hotMiddleware.publish({ action: 'reload' })
        cb()
    })
})

// proxy api requests
Object.keys(proxyTable).forEach(function(context) {
    var options = proxyTable[context]
    if (typeof options === 'string') {
        options = { target: options }
    }
    app.use(proxyMiddleware(options.filter || context, options))
})

// handle fallback for HTML5 history API
app.use(require('connect-history-api-fallback')())

// serve webpack bundle output
app.use(devMiddleware)

// enable hot-reload and state-preserving
// compilation error display
app.use(hotMiddleware)

// serve pure static assets
var staticPath = path.posix.join(config.dev.assetsPublicPath, config.dev.assetsSubDirectory)
app.use(staticPath, express.static('./static'))

var uri = 'http://localhost:' + port

var _resolve
var readyPromise = new Promise(resolve => {
    _resolve = resolve
})

console.log('> Starting dev server...')
devMiddleware.waitUntilValid(() => {
    console.log('> Listening at ' + uri + '\n')
        // when env is testing, don't need open it
    if (autoOpenBrowser && process.env.NODE_ENV !== 'testing') {
        opn(uri)
    }
    _resolve()
})

var server = app.listen(port)

module.exports = {
    ready: readyPromise,
    close: () => {
        server.close()
    }
}