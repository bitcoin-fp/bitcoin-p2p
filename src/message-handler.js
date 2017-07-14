var msgReader = require('./message-reader')
var msgWriter = require('./message-writer')

var handlers = (socket) => (cmd) => {
  var strategies = {
    'version': (payload) => {
      console.log(payload)
      var getheaders = msgWriter.getHeaders({protocol: 70015, network: 'mainnet'})
      socket.write(getheaders)
      console.log('sent [getheaders] data')
    },
    'verack': (payload) => {
      var verack = msgWriter.verack({network: 'mainnet'})
      socket.write(verack)
      console.log('sent [verack] data')
    },
    'headers': (payload) => {
      console.log(payload)
    },
    'ping': (payload) => {
      var pong = msgWriter.pong({network: 'mainnet', nonce: payload.nonce})
      socket.write(pong)
      console.log('sent [pong] data')
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
  console.log('received [' + message.header.command + '] data from ' + socket.remoteAddress)
  if (handlers(socket)(cmd)) handlers(socket)(cmd)(payload)
}

var register = (sockets) => {
  sockets.forEach((socket) => {
    socket.on('data', handle(socket))
    var version = msgWriter.version({protocol: 70015, addrMe: socket.localAddress, addrYou: socket.remoteAddress, network: 'mainnet', blockHeight: 0})
    socket.write(version)
    console.log('version sent to ' + socket.remoteAddress)
  })
}

module.exports = {
  handle: handle,
  register: register
}
