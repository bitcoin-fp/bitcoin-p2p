var msgReader = require('./message-reader')
var msgWriter = require('./message-writer')
var utils = require('./utils')
var blockchain = require('./blockchain')

var handlers = (socket) => (cmd) => {
  var strategies = {
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
    }
  }
  return strategies[cmd]
}

var handle = (socket) => (data) => {
  var message = msgReader.read(data)
  var cmd = message.header.command
  var payload = message.payload
  console.log('[' + message.header.command + '] received from ' + socket.connection.remoteAddress + '\n')
  if (handlers(socket)(cmd)) handlers(socket)(cmd)(payload)
}

var register = (socket) => {
  socket.connection.on('data', handle(socket))
  var getheaders = msgWriter.write('getheaders', {protocol: 70015, network: 'mainnet'})
  socket.write(getheaders)
  console.log('[getheaders] sent to ' + socket.remoteAddress + '\n')
}

module.exports = {
  register: register
}
