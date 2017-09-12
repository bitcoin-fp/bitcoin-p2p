var Socket = require('./socket')
var Exception = require('./exception')

var readyPool = []
var handshakedPool = []

var peerSocket = (network) => (ip) => {
  return new Promise((resolve, reject) => {
    resolve(new Socket(ip, network))
  })
}

var pushToReadyPool = (peerSockets) => {
  return new Promise((resolve, reject) => {
    readyPool = readyPool.concat(peerSockets)
    resolve()
  })
}

var popFromReadyPool = () => readyPool.shift()

var buildHandShakedPool = () => {
  var peerSocket = popFromReadyPool()
  if (peerSocket) peerSocket.connect()
  else return

  // check handshake status
  var iter = 0
  var intervalId = setInterval(function () {
    if (peerSocket.isHandshaked()) {
      clearInterval(intervalId)
      pushToHandshakedPool(peerSocket)
      console.log('Handshake done. Total: ' + handshakedPool.length)
      buildHandShakedPool()
    } else if (iter === 3) {
      clearInterval(intervalId)
      peerSocket.disconnect()
      console.log('Handshake fail.')
      buildHandShakedPool()
    }
    iter++
  }, 3000)
}

var pushToHandshakedPool = (peerSocket) => handshakedPool.push(peerSocket)

var popFromHandshakedPool = () => handshakedPool.shift()

var isSyncingHeaders = false
var syncHeaders = () => {
  if (!isSyncingHeaders) {
    try {
      isSyncingHeaders = true
      var peerSocket = popFromHandshakedPool()
      if (peerSocket) peerSocket.syncHeaders()
      else throw new Exception('no peer socket')
    } catch (e) {
      isSyncingHeaders = false
    }
  }
}

// var syncBlocks = () => {

// }

var connect = () => {
  console.log('start sync')

  buildHandShakedPool()
  setInterval(syncHeaders, 3000)
  // syncBlocks()
}

var buildPool = (network) => (ips) => {
  // ips = ['46.166.160.96', '60.251.143.133', '195.154.69.36', '45.32.75.82'] //test code
  var peerSockets = ips.map(peerSocket(network))
  Promise.all(peerSockets).then(pushToReadyPool).then(connect).catch(console.log)
  return peerSockets
}

module.exports = {
  buildPool: buildPool
}
