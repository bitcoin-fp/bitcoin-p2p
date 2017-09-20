var Socket = require('./socket')
var Exception = require('./exception')
var writescLog = require('./logger').logsc
var writehsLog = require('./logger').loghs

var emitter = require('node-singleton-event')

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
  else {
    writescLog('[Info] There are no more sockets to handshake.')
    return
  }

  // check handshake status
  var iter = 0
  var intervalId = setInterval(function () {
    if (peerSocket.isHandshaked()) {
      clearInterval(intervalId)
      pushToHandshakedPool(peerSocket)
      writescLog('Handshake done. Total: ' + handshakedPool.length + ' socket(s) on stack.')
      buildHandShakedPool()
    } else if (iter === 3) {
      clearInterval(intervalId)
      peerSocket.disconnect()
      writescLog('[Warning] Fail in handshake to discard socket.')
      buildHandShakedPool()
    }
    iter++
  }, 3000)
}

var pushToHandshakedPool = (peerSocket) => {
  peerSocket.keepAlive()
  handshakedPool.push(peerSocket)
}

var popFromHandshakedPool = () => handshakedPool.shift()

emitter.on('keep-aliving-error', function () {
  handshakedPool = handshakedPool.filter((peerSocket) => peerSocket.isAlive())
})

var isSyncingHeaders = false
var syncHeaders = () => {
  if (!isSyncingHeaders) {
    try {
      isSyncingHeaders = true
      var peerSocket = popFromHandshakedPool()
      if (peerSocket) peerSocket.syncHeaders()
      else throw new Exception('No peer socket found.')
    } catch (e) {
      isSyncingHeaders = false
      writehsLog('[Warning] ' + e.message)
    }
  }
}

emitter.on('header-sync-error', function () {
  isSyncingHeaders = false
})

// var syncBlocks = () => {

// }

var connect = () => {
  console.log('Start syncing with other nodes.')

  buildHandShakedPool()
  setInterval(syncHeaders, 3000)
  // syncBlocks()
}

var buildPool = (network) => (ips) => {
  // ips = ['46.166.160.96', '60.251.143.133', '195.154.69.36', '45.32.75.82'] //test code
  // ips = ['104.237.2.189']
  // ips = ['88.99.170.66']
  var peerSockets = ips.map(peerSocket(network))
  Promise.all(peerSockets).then(pushToReadyPool).then(connect).catch(console.log)
  return peerSockets
}

module.exports = {
  buildPool: buildPool
}
