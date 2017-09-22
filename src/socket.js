var net = require('net')
var crypto = require('crypto')
var utils = require('./utils')
var NETWORK = require('./const').NETWORK
var PORT = require('./const').PORT
// var connectionHandler = require('./connection-handler')
// var headerSynchorizer = require('./header-synchorizer')
// var keepaliveHandler = require('./keepalive-handler')
// var blockSynchorizer = require('./block-synchorizer')
// var addressSynchorizer = require('./address-synchorizer')
var writeLog = require('./logger').logsc

function Socket (ip, network) {
  this.ip = ip
  this.network = network
  this.id = utils.readUIntLE(8)(crypto.randomBytes(8))

  this.connection = new net.Socket()
  this.connection.setTimeout(10000)
  this.connection.on('error', (err) => {
    writeLog('[Error] Fail in peer connection ' + this.ip + '.')
    writeLog(err)
    this.disconnect()
  })
  this.connection.on('timeout', () => {
    writeLog('[Error] Peer connection timeout ' + this.ip + '.')
    this.disconnect()
  })

  this.isHandshaked = false
  this.isAlive = false
  this.syncing = false
}

Socket.prototype.connect = function () {
  var _this = this
  return new Promise((resolve, reject) => {
    _this.connection.connect({
      port: this.network === NETWORK.MAINNET ? PORT.MAINNET : PORT.TESTNET,
      host: this.ip,
      localPort: 8333
    }, () => {
      writeLog('Peer ' + _this.ip + ' connected.')
      resolve(_this)
    })
  })
}

Socket.prototype.getId = function () {
  return this.id
}

Socket.prototype.disconnect = function () {
  this.setStatus(-1)
  this.connection.destroy()
}

Socket.prototype.setStatus = function (status) {
  switch (status) {
    case 0:
      this.isHandshaked = true
      break
    case 1:
      this.isAlive = true
      break
    case 2:
      this.syncing = true
      break
    case -1:
      this.isAlive = false
      break
    default:
      break
  }
}

Socket.prototype.isHandshakDone = function () {
  return this.isHandshaked
}

Socket.prototype.isHealthy = function () {
  return this.isAlive
}

Socket.prototype.isSyncing = function () {
  return this.syncing
}

Socket.prototype.write = function (bMessage) {
  this.connection.write(bMessage)
}

module.exports = Socket
