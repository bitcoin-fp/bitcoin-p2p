var net = require('net')
var NETWORK = require('./const').NETWORK
var PORT = require('./const').PORT
var connectionHandler = require('./connection-handler')
var headerSynchorizer = require('./header-synchorizer')
var keepaliveHandler = require('./keepalive-handler')
// var blockSynchorizer = require('./block-synchorizer')
// var addressSynchorizer = require('./address-synchorizer')
var writeLog = require('./logger').logsc

var emitter = require('node-singleton-event')

function Socket (ip, network) {
  this.ip = ip
  this.network = network

  this.isVersionSent = false
  this.isVersionBack = false
  this.isVerackSent = false
  this.isVerackBack = false

  this.connection = new net.Socket()

  this.status = null
  this.alive = false
  this.syncing = false
}

Socket.prototype.connect = function () {
  var _this = this
  this.connection.connect({
    port: this.network === NETWORK.MAINNET ? PORT.MAINNET : PORT.TESTNET,
    host: this.ip,
    localPort: 8333
  }, () => {
    writeLog('Peer ' + _this.ip + ' connected.')
    _this.status = 'connection-handling'
    connectionHandler.register(_this)
  })

  this.connection.on('error', (err) => {
    writeLog('[Error] Fail in peer connection ' + _this.ip + '.')
    writeLog(err)
    writeLog(err.stack)
    _this.alive = false
    if (_this.status === 'header-syncing') emitter.emit('header-syncing-error')
    else if (_this.status === 'keep-aliving') emitter.emit('keep-aliving-error')
  })
}

Socket.prototype.disconnect = function () {
  this.alive = false
  this.syncing = false
  this.connection.destroy()
}

// Socket.prototype.syncBlockData = function () {
//   blockSynchorizer.register(this)
// }

Socket.prototype.syncHeaders = function () {
  this.status = 'header-syncing'
  this.syncing = true
  headerSynchorizer.register(this)
}

// Socket.prototype.getMorePeerAddresses = function () {
//   addressSynchorizer.register(this)
// }

Socket.prototype.keepAlive = function () {
  this.alive = true
  this.status = 'keep-aliving'
  keepaliveHandler.register(this)
}

Socket.prototype.isHandshaked = function () {
  return this.isVersionSent && this.isVersionBack && this.isVerackSent && this.isVerackBack
}

Socket.prototype.isAlive = function () {
  return this.alive
}

Socket.prototype.isSyncing = function () {
  return this.syncing
}

Socket.prototype.write = function (bMessage) {
  this.connection.write(bMessage)
}

Socket.prototype.setVersionSent = function (isSent) {
  this.isVersionSent = isSent
}

Socket.prototype.setVersionBack = function (isBack) {
  this.isVersionBack = isBack
}

Socket.prototype.setVerackSent = function (isSent) {
  this.isVerackSent = isSent
}

Socket.prototype.setVerackBack = function (isBack) {
  this.isVerackBack = isBack
}

module.exports = Socket
