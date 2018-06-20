const Logger = require('log4js').getLogger()
module.exports = {
    init: (io) => {
        io.on('connection', function (socket) {
            socket.on('register', (dealedFile) => {
                Logger.info(`收到文件注册信息: ${dealedFile}`)
                global.fileSocketMap[dealedFile] = socket
            })
            socket.on('disconnect', function () {
                Logger.info('exit')
            })
        })
    },
    emitFileInfo: (dealedFile, data) => {
        let socket = global.fileSocketMap[dealedFile]
        if (socket) {
            socket.emit('status', data || global.processResults[dealedFile])
            Logger.info(`发送文件处理结果: ${dealedFile}`)
        } else {
            let times = 3
            let interval = setInterval(() => {
                times++
                setTimeout(() => {
                    let trySocket = global.fileSocketMap[dealedFile]
                    if (trySocket) {
                        trySocket.emit('status', data || global.processResults[dealedFile])
                        Logger.info(`发送文件处理结果: ${dealedFile}`)
                    }
                }, 1000)
                if (times >= 3) {
                    clearInterval(interval)
                }
            })
        }
    }
}