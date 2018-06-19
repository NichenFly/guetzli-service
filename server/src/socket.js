const Logger = require('log4js').getLogger()
module.exports = {
    init: (io) => {
        io.on('connection', function (socket) {
            Logger.info(`a user(socketId:${socket.id}) connected`)
            socket.on('', () => {
            })
            socket.on('disconnect', function () {
                Logger.info('exit')
            })
        })
    }
}