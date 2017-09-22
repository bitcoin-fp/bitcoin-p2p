var Socket = require('./socket')
var writescLog = require('./logger').logsc
var writehsLog = require('./logger').loghs

var connectionHandler = require('./connection-handler')
var keepaliveHandler = require('./keepalive-handler')
var headerSynchorizer = require('./header-synchorizer')

var readyPool = []
var handshakedPool = []
var headerSyncPool = []

var buildHandShakedPool = () => {
  if (handshakedPool.length >= 10) return

  var peerSocket = readyPool.shift()
  if (!peerSocket) {
    writescLog('[Info] There are no more sockets to handshake.')
    return
  }

  connectionHandler.register(peerSocket).then((socket) => {
    keepaliveHandler.register(socket)
    handshakedPool.push(socket)
    writescLog('Handshake done. Total: ' + handshakedPool.length + ' socket(s) on stack.')
  })
}

var syncHeaders = () => {
  if (headerSyncPool.length >= 1) return

  var handshakedSocket = handshakedPool.shift()
  if (!handshakedSocket) {
    writehsLog('[Info] There are no more sockets to sync header.')
    return
  } else if (!handshakedSocket.isHealthy()) {
    writehsLog('[Info] The socket is dead.')
    return
  }

  headerSynchorizer.register(handshakedSocket).then((socket) => {
    headerSyncPool.push(socket)
    writehsLog('Header sync added. Total: ' + headerSyncPool.length + ' socket(s) on stack.')
  })
}

// var syncBlocks = () => {
// }

var checkPoolHealth = () => {
  handshakedPool = handshakedPool.filter((socket) => socket.isHealthy())
  headerSyncPool = headerSyncPool.filter((socket) => socket.isHealthy())
  writescLog('Health checked. Total: ' + handshakedPool.length + ' socket(s) in Handshake-Pool.')
  writescLog('Health checked. Total: ' + headerSyncPool.length + ' socket(s) in Header-Sync-Pool.')
}

var buildPool = (network) => (ips) => {
  ips.forEach((ip) => {
    var socket = new Socket(ip, network)
    socket.connect()
    .then(() => {
      readyPool.push(socket)
      writescLog('[Info] There are ' + readyPool.length + ' sockets available.')
    })
    .catch(console.log)
  })
}

var init = () => {
  setInterval(buildHandShakedPool, 10000)
  setInterval(syncHeaders, 3000)
  setInterval(checkPoolHealth, 10000)
}

module.exports = {
  buildPool: buildPool,
  init: init
}
