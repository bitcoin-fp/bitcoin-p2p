var utils = require('./utils')
var Blockchain = require('./blockchain')
var PORT = require('./const').PORT
var Magic = require('./const').Magic
var Command = require('./const').Command
var crypto = require('crypto')

/* Address
 * Doc => https://en.bitcoin.it/wiki/Protocol_documentation#Network_address
 */
var address = (ip, port) => {
  var service = Buffer.from([0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])
  var ipHex = ip.split('.').map((digi) => '0x' + utils.writeUIntBE(1)(parseInt(digi)).toString('hex'))
  var bIpv4 = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xff].concat(ipHex))
  var bPort = utils.writeUIntBE(2)(port)

  var addr = utils.bufferConcat([service, bIpv4, bPort])

  return addr
}

/* Version
 * Doc => https://en.bitcoin.it/wiki/Protocol_documentation#version
 */
var version = (opts) => {
  var protocol = utils.writeUIntLE(4)(opts.protocol)
  var service = Buffer.from([0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])
  var timestamp = utils.writeUIntLE(8)(opts.timestamp ? opts.timestamp : new Date().getTime())
  var addrYou = address(opts.addrYou, PORT[opts.network.toUpperCase()])
  var addrMe = address(opts.addrMe, PORT[opts.network.toUpperCase()])
  var nodeId = opts.nodeId ? opts.nodeId : crypto.randomBytes(8)
  var subverLength = utils.writeUIntLE(1)('/Satoshi:0.14.2/'.length)
  var subver = Buffer.from('/Satoshi:0.14.2/')
  var blockHeight = utils.writeUIntLE(4)(opts.blockHeight)
  var relay = opts.protocol >= 70001 ? Buffer.from([0x00]) : Buffer.from([])

  var payload = utils.bufferConcat([protocol, service, timestamp, addrYou, addrMe, nodeId, subverLength, subver, blockHeight, relay])
  var header = addMessageHeader(opts.network, 'version', payload)
  var message = utils.prefixBy(header)(payload)

  return message
}

/* Verack
 * Doc => https://en.bitcoin.it/wiki/Protocol_documentation#verack
 */
var verack = (opts) => {
  var payload = Buffer.alloc(0)
  return addMessageHeader(opts.network, 'verack', payload)
}

/* Get Headers
 * Doc => https://en.bitcoin.it/wiki/Protocol_documentation#getheaders
 */
var getHeaders = (opts) => {
  var protocol = utils.writeUIntLE(4)(opts.protocol)

  return Blockchain.getLocatorObjects().then((hashes) => {
    var locatorObjects = hashes.map((hash) => Buffer.from(utils.reverseHex(hash), 'hex'))

    var hashCount = utils.writeVarInt(locatorObjects.length)
    var locatorHashes = utils.bufferConcat(locatorObjects)
    var hashStop = Buffer.alloc(32)

    var payload = utils.bufferConcat([protocol, hashCount, locatorHashes, hashStop])
    var header = addMessageHeader(opts.network, 'getheaders', payload)
    var message = utils.prefixBy(header)(payload)
    return message
  })
}

/* Pong
 * Doc => https://en.bitcoin.it/wiki/Protocol_documentation#pong
 */
var pong = (opts) => {
  var nonce = utils.writeUIntLE(8)(opts.nonce)
  var payload = utils.bufferConcat([nonce])
  var header = addMessageHeader(opts.network, 'pong', payload)
  var message = utils.prefixBy(header)(payload)

  return message
}

/* Inventory
 * Doc => https://en.bitcoin.it/wiki/Protocol_documentation#Inventory_Vectors
 */
var inventory = (opts) => {
  var type = utils.writeUIntLE(4)(4)
  var bHash = Buffer.from(opts.hash, 'hex')

  var inv = utils.bufferConcat([type, bHash])

  return inv
}

/* Get Data
 * Doc => https://en.bitcoin.it/wiki/Protocol_documentation#getdata
 */
var getData = (opts) => {
  var invs = opts.hashes.map(inventory)

  var payload = utils.bufferConcat([utils.writeVarInt(opts.hashes.length)].concat(invs))
  var header = addMessageHeader(opts.network, 'getdata', payload)
  var message = utils.prefixBy(header)(payload)

  return message
}

/* Block Data
 * Doc => https://en.bitcoin.it/wiki/Protocol_documentation#block
 */
// var block = (raw) => {

// }

/* Message Header
 * Doc => https://en.bitcoin.it/wiki/Protocol_documentation#Message_structure
 */
var addMessageHeader = (network, command, payload) => {
  var magic = Buffer.from(Magic[network.toUpperCase()])
  var cmd = Buffer.from(Command[command.toUpperCase()])
  var payloadLength = utils.writeUIntLE(4)(payload.length)
  var PayloadChecksum = utils.slice(0, 4)(utils.dsha256(payload))

  var header = utils.bufferConcat([magic, cmd, payloadLength, PayloadChecksum])

  return header
}

var write = (cmd, opts) => {
  var cmds = {
    version: version,
    verack: verack,
    address: address,
    getheaders: getHeaders,
    getdata: getData,
    inventory: inventory,
    pong: pong
  }
  return cmds[cmd](opts)
}

module.exports = {
  write: write
}
