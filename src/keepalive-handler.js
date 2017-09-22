var msgReader = require('./message-reader')
var msgWriter = require('./message-writer')
var writeLog = require('./logger').logsc
var crypto = require('crypto')
var utils = require('./utils')

var _nonce = null

var handlers = (socket) => (cmd) => {
  var strategies = {
    'ping': (payload) => {
      var pong = msgWriter.write('pong', {network: 'mainnet', nonce: payload.nonce})
      socket.write(pong)
      writeLog('[pong] sent to ' + socket.connection.remoteAddress)
    },
    'pong': (payload) => {
      if (socket.isSyncing()) return
      if (payload.nonce === _nonce) {
        socket.setStatus(1) // socket is alive
        setTimeout(() => {
          _nonce = utils.readUIntLE(8)(crypto.randomBytes(8))
          var ping = msgWriter.write('ping', {nonce: _nonce, network: 'mainnet'})
          socket.write(ping)
          writeLog('[ping] sent to ' + socket.connection.remoteAddress)
        }, 5000)
      } else {
        socket.disconnect()
      }
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
  _nonce = utils.readUIntLE(8)(crypto.randomBytes(8))
  var ping = msgWriter.write('ping', {nonce: _nonce, network: 'mainnet'})
  socket.write(ping)
  writeLog('[ping] sent to ' + socket.connection.remoteAddress)
}

module.exports = {
  register: register
}
