var msgReader = require('./message-reader')
var msgWriter = require('./message-writer')
var utils = require('./utils')
var blockchain = require('./blockchain')

var handlers = (socket) => (cmd) => {
  var strategies = {
    'version': (payload) => {
      console.log(JSON.stringify(payload) + '\n')
      var verack = msgWriter.write('verack', {network: 'mainnet'})
      socket.write(verack)
      console.log('[verack] sent to ' + socket.remoteAddress + '\n')
    },
    'verack': (payload) => {
      var getheaders = msgWriter.write('getheaders', {protocol: 70015, network: 'mainnet'})
      socket.write(getheaders)
      console.log('[getheaders] sent to ' + socket.remoteAddress + '\n')
    },
    'headers': (payload) => {
      payload.headers.forEach((header) => {
        header.hash = utils.blockHash(header).toString('hex')
        blockchain.addBlock(header)
      })
      console.log(blockchain.getBlockchain())
      setTimeout(() => {
        var getheaders = msgWriter.write('getheaders', {protocol: 70015, network: 'mainnet'})
        socket.write(getheaders)
        console.log('[getheaders] sent to ' + socket.remoteAddress + '\n')
      }, 5000)
    },
    'ping': (payload) => {
      var pong = msgWriter.write('pong', {network: 'mainnet', nonce: payload.nonce})
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
    var version = msgWriter.write('version', {protocol: 70015, addrMe: socket.localAddress, addrYou: socket.remoteAddress, network: 'mainnet', blockHeight: 1})
    socket.write(version)
    console.log('[version] sent to ' + socket.remoteAddress + '\n')
  })
}

module.exports = {
  handle: handle,
  register: register
}
