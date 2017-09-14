var msgReader = require('./message-reader')
var msgWriter = require('./message-writer')
var utils = require('./utils')
var Blockchain = require('./blockchain')

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
            console.log('[getheaders] sent to ' + socket.connection.remoteAddress + '\n')
          })
        }, 5000)
      }).catch((err) => console.log(err))
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
  // var getheaders = msgWriter.write('getheaders', {protocol: 70015, network: 'mainnet'})
  msgWriter.write('getheaders', {protocol: 70015, network: 'mainnet'}).then((getheaders) => {
    socket.write(getheaders)
    console.log('[getheaders] sent to ' + socket.connection.remoteAddress + '\n')
  })
}

module.exports = {
  register: register
}
