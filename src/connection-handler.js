var msgReader = require('./message-reader')
var msgWriter = require('./message-writer')
var writeLog = require('./logger').logsc

var handlers = (socket) => (cmd) => {
  var strategies = {
    'version': (payload) => {
      writeLog('The remote node has ' + payload.blockHeight + ' block(s).')

      var verack = msgWriter.write('verack', {network: 'mainnet'})
      socket.write(verack)
      writeLog('[verack] sent to ' + socket.connection.remoteAddress)
    },
    'verack': (payload) => {
      socket.setStatus(0) // Handshake is done.
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
  var version = msgWriter.write('version', {protocol: 70015, addrMe: socket.connection.localAddress, addrYou: socket.connection.remoteAddress, network: 'mainnet', blockHeight: 1})
  socket.write(version)
  writeLog('[version] sent to ' + socket.connection.remoteAddress)
  return new Promise((resolve, reject) => {
    var i = setInterval(() => {
      if (socket.isHandshakDone()) {
        clearInterval(i)
        resolve(socket)
      }
    }, 3000)
  })
}

module.exports = {
  register: register
}
