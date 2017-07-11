var net = require('net')
var NETWORK = require('./const').NETWORK
var PORT = require('./const').PORT
var msgWriter = require('./message').writer

var peerConnection = (network) => (ip) => {
  return new Promise((resolve, reject) => {
    var socket = new net.Socket()
    socket.connect({
      port: network === NETWORK.MAINNET ? PORT.MAINNET : PORT.TESTNET,
      host: ip
    }, () => {
      console.log('peer ' + ip + ' connected')
      resolve(socket)
    })

    socket.on('error', (err) => {
      console.log('peer ' + ip + ' connect fail')
      reject(err)
    })

    socket.on('data', function (data) {
      console.log('received data from ' + socket.remoteAddress)
      console.log(data)
    })
  })
}

var send = (socket) => {
  console.log(socket.localAddress)
  console.log(socket.remoteAddress)
  var version = msgWriter.version({protocol: 60002, addrMe: socket.localAddress, addrYou: socket.remoteAddress, network: 'mainnet', blockHeight: 0})
  socket.write(version)
}

var allPeersConnected = (peerSockets) => {
  console.log('All ' + peerSockets.length + ' peers connected!')
  send(peerSockets[0])
}

var connect = (network) => (ips) => {
  var allPeersConnection = ips.map(peerConnection(network))
  Promise.all(allPeersConnection).then(allPeersConnected).catch(console.log)
  return allPeersConnection
}

module.exports = {
  connect: connect
}
