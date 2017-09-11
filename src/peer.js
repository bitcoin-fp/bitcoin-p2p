var Socket = require('./socket')
var headerSynchorizer = require('./header-synchorizer')

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
    } else if (iter == 3) {
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
  console.log('start syncing headers')
  if (isSyncingHeaders) {
    return
  } else {
    try {
      console.log('a')
      isSyncingHeaders = true
      var peerSocket = popFromHandshakedPool()
      if (peerSocket) headerSynchorizer.register(peerSocket)
      else throw "no peer socket"
    }
    catch (e) {
      console.log('b')
      isSyncingHeaders = false
    }
  }
}

var syncBlocks = () => {

}

var connect = () => {
  console.log('start sync')

  buildHandShakedPool()
  // syncHeaders()
  setInterval(syncHeaders, 3000)
  // syncBlocks()
}

var buildPool = (network) => (ips) => {
  // ips = ['46.166.160.96', '60.251.143.133', '195.154.69.36', '45.32.75.82'] //test code
  ips = ['60.251.143.133'] //test code
  var peerSockets = ips.map(peerSocket(network))
  Promise.all(peerSockets).then(pushToReadyPool).then(connect).catch(console.log)
  return peerSockets
}

module.exports = {
  buildPool: buildPool
}
