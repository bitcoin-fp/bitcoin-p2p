var net = require('net')
var NETWORK = require('./const').NETWORK
var PORT = require('./const').PORT

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
  })
}

var allPeersConnected = (peerSockets) => {
  console.log('All ' + peerSockets.length + ' peers connected!')
}

var connect = (network) => (ips) => {
  var allPeersConnection = ips.map(peerConnection(network))
  Promise.all(allPeersConnection).then(allPeersConnected).catch(console.log)
  return allPeersConnection
}

module.exports = {
  connect: connect
}
