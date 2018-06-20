const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const Logger = require('log4js').getLogger()
const bodyParser = require('body-parser')

// 初始化全局变量
require('./constants')

const config = require('./config')
const api = require('./api')
const socket = require('./socket')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

const apiRoutes = express.Router()
app.use('/api', apiRoutes)

// api初始化
api.init(apiRoutes)

// socket初始化
socket.init(io)

http.listen(config.port, () => {
    Logger.info('已启动, 监听端口: %s', config.port)
})