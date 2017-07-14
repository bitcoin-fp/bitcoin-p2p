var net = require('net')
var NETWORK = require('./const').NETWORK
var PORT = require('./const').PORT
var msgHandler = require('./message-handler')

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
  // msgHandler.register([peerSockets[0]]) //test code
  msgHandler.register(peerSockets)
}

var connect = (network) => (ips) => {
  // ips = ['195.154.69.36'] //test code
  // ips = ['46.166.160.96'] //test code
  var allPeersConnection = ips.map(peerConnection(network))
  Promise.all(allPeersConnection).then(allPeersConnected).catch(console.log)
  return allPeersConnection
}

module.exports = {
  connect: connect
}
