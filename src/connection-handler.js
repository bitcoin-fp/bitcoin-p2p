var msgReader = require('./message-reader')
var msgWriter = require('./message-writer')

var handlers = (socket) => (cmd) => {
  var strategies = {
    'version': (payload) => {
      console.log(JSON.stringify(payload) + '\n')
      socket.setVersionBack(true)

      var verack = msgWriter.write('verack', {network: 'mainnet'})
      socket.write(verack)
      socket.setVerackSent(true)
      console.log('[verack] sent to ' + socket.connection.remoteAddress + '\n')
    },
    'verack': (payload) => {
      socket.setVerackBack(true)
    },
    'ping': (payload) => {
      var pong = msgWriter.write('pong', {network: 'mainnet', nonce: payload.nonce})
      socket.write(pong)
      console.log('[pong] sent to ' + socket.connection.remoteAddress + '\n')
    }
  }
  return strategies[cmd]
}

var handle = (socket) => (data) => {
  var message = msgReader.read(data)
  var cmd = message.header.command
  var payload = message.payload
  if (handlers(socket)(cmd)) {
    console.log('[' + message.header.command + '] received from ' + socket.connection.remoteAddress + '\n')
    handlers(socket)(cmd)(payload)
  }
}

var register = (socket) => {
  socket.connection.on('data', handle(socket))
  var version = msgWriter.write('version', {protocol: 70015, addrMe: socket.connection.localAddress, addrYou: socket.connection.remoteAddress, network: 'mainnet', blockHeight: 1})
  socket.write(version)
  socket.setVersionSent(true)
  console.log('[version] sent to ' + socket.connection.remoteAddress + '\n')
}

module.exports = {
  register: register
}
