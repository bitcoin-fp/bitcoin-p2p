var Socket = require('./socket')
var msgHandler = require('./message-handler')

var readyPool = []
var handshakedPool = []

var peerSocket = (network) => (ip) => {
  return new Promise((resolve, reject) => {
    resolve(new Socket(ip, network))
  })
}

var pushToPool = (peerSockets) => {
  return new Promise((resolve, reject) => {
    readyPool = readyPool.concat(peerSockets)
    resolve()
  })
}

var popFromPool = () => readyPool.shift()

var connect = () => {
  console.log('start sync')
  var peerSocket = popFromPool()
  peerSocket.connect()

  // check handshake status
  var iter = 0
  var intervalId = setInterval(function () {
    if (peerSocket.isHandshaked()) {
      clearInterval(intervalId)
      handshakedPool.push(peerSocket)
    } else if (iter == 3) {
      peerSocket.disconnect()
      connect()
    }
    iter++
  }, 3000)
}

var buildPool = (network) => (ips) => {
  ips = ['46.166.160.96', '60.251.143.133', '195.154.69.36', '45.32.75.82'] //test code
  var peerSockets = ips.map(peerSocket(network))
  Promise.all(peerSockets).then(pushToPool).then(connect).catch(console.log)
  return peerSockets
}

module.exports = {
  buildPool: buildPool
}
