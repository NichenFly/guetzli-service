const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)

const config = require('./config')
const Logger = require('log4js').getLogger()
const bodyParser = require('body-parser')

// api定义
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