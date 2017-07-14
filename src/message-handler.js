var msgReader = require('./message-reader')
var msgWriter = require('./message-writer')

var handlers = (socket) => (cmd) => {
  var strategies = {
    'version': (payload) => {
      console.log(JSON.stringify(payload) + '\n')
      var getheaders = msgWriter.getHeaders({protocol: 70015, network: 'mainnet'})
      socket.write(getheaders)
      console.log('[getheaders] sent to ' + socket.remoteAddress + '\n')
    },
    'verack': (payload) => {
      var verack = msgWriter.verack({network: 'mainnet'})
      socket.write(verack)
      console.log('[verack] sent to ' + socket.remoteAddress + '\n')
    },
    'headers': (payload) => {
      //TO STORE DATA
    },
    'ping': (payload) => {
      var pong = msgWriter.pong({network: 'mainnet', nonce: payload.nonce})
      socket.write(pong)
      console.log('[pong] sent to ' + socket.remoteAddress + '\n')
    },
    'addr': (payload) => {

    }
  }
  return strategies[cmd]
}

var handle = (socket) => (data) => {
  var message = msgReader.read(data)
  var cmd = message.header.command
  var payload = message.payload
  console.log('[' + message.header.command + '] received from ' + socket.remoteAddress + '\n')
  if (handlers(socket)(cmd)) handlers(socket)(cmd)(payload)
}

var register = (sockets) => {
  sockets.forEach((socket) => {
    socket.on('data', handle(socket))
    var version = msgWriter.version({protocol: 70015, addrMe: socket.localAddress, addrYou: socket.remoteAddress, network: 'mainnet', blockHeight: 0})
    socket.write(version)
    console.log('[version] sent to ' + socket.remoteAddress + '\n')
  })
}

module.exports = {
  handle: handle,
  register: register
}
