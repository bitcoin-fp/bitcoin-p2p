var msgReader = require('./message-reader')
var msgWriter = require('./message-writer')
var utils = require('./utils')
var Blockchain = require('./blockchain')
var writeLog = require('./logger').loghs

var handlers = (socket) => (cmd) => {
  var strategies = {
    'headers': (payload) => {
      payload.headers.forEach((header) => {
        header.hash = utils.blockHash(header).toString('hex')
      })
      Blockchain.addBlockHeaders(payload.headers).then(() => {
        setTimeout(() => {
          msgWriter.write('getheaders', {protocol: 70015, network: 'mainnet'}).then((getheaders) => {
            socket.write(getheaders)
            writeLog('[getheaders] sent to ' + socket.connection.remoteAddress)
          })
        }, 5000)
      }).catch((err) => {
        writeLog('[Error] ' + err)
      })
    }
  }
  return strategies[cmd]
}

var handle = (socket) => (data) => {
  var message = msgReader.read(data)
  var cmd = message.header.command
  var payload = message.payload
  if (handlers(socket)(cmd)) {
    writeLog('[' + message.header.command + '] received from ' + socket.connection.remoteAddress)
    handlers(socket)(cmd)(payload)
  }
}

var register = (socket) => {
  socket.connection.on('data', handle(socket))
  msgWriter.write('getheaders', {protocol: 70015, network: 'mainnet'}).then((getheaders) => {
    socket.write(getheaders)
    writeLog('[getheaders] sent to ' + socket.connection.remoteAddress)
  })
}

module.exports = {
  register: register
}
