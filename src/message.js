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
  var subverLength = utils.writeUIntLE(1)('/Satoshi:0.7.2/'.length)
  var subver = Buffer.from('/Satoshi:0.7.2/')
  var blockHeight = utils.writeUIntLE(4)(opts.blockHeight)

  var payload = utils.bufferConcat([protocol, service, timestamp, addrYou, addrMe, nodeId, subverLength, subver, blockHeight])
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
  var hashCount = utils.writeUIntLE(1)(1)
  var highestBlock = Blockchain.getHighestBlock()
  var highestBlockHash = Buffer.from(utils.reverseHex(highestBlock.hash), 'hex')
  var hashStop = Buffer.alloc(32)

  var payload = utils.bufferConcat([protocol, hashCount, highestBlockHash, hashStop])
  var header = addMessageHeader(opts.network, 'getheaders', payload)
  var message = utils.prefixBy(header)(payload)

  return message
}

/* Inventory
 * Doc => https://en.bitcoin.it/wiki/Protocol_documentation#Inventory_Vectors
 */
var inventory = (hash) => {
  var type = utils.writeUIntLE(4)(2)
  var bHash = Buffer.from(utils.reverseHex(hash), 'hex')

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

/* Block Headers Data
 * Doc => https://en.bitcoin.it/wiki/Protocol_documentation#Block_Headers
 */
var blockHeader = (hex) => {
  var header = Buffer.from(hex, 'hex')
  return {
    version: utils.slice(0, 4)(header),
    prev_block: utils.slice(4, 36)(header),
    merkle_root: utils.slice(36, 68)(header),
    timestamp: utils.slice(68, 72)(header),
    difficulty: utils.slice(72, 76)(header),
    nonce: utils.slice(76, 80)(header),
    txn_count: utils.slice(80, 81)(header)
  }
}

/* Headers Data
 * Doc => https://en.bitcoin.it/wiki/Protocol_documentation#headers
 */
var headers = (raw) => {
  var isStartedFD = utils.bufferStartsWith(Buffer.from([0xFD]))
  var isStartedFE = utils.bufferStartsWith(Buffer.from([0xFE]))
  var isStartedFF = utils.bufferStartsWith(Buffer.from([0xFF]))

  var bInt
  var bHeaders
  if (isStartedFF(raw)) {
    bInt = raw.slice(0, 8)
    bHeaders = raw.slice(8)
  } else if (isStartedFE(raw)) {
    bInt = raw.slice(0, 4)
    bHeaders = raw.slice(4)
  } else if (isStartedFD(raw)) {
    bInt = raw.slice(0, 2)
    bHeaders = raw.slice(2)
  } else {
    bInt = raw.slice(0, 1)
    bHeaders = raw.slice(1)
  }
  var count = utils.readVarInt(bInt)
  var headers = bHeaders.toString('hex').match(/.{81}/g).map(blockHeader)

  return {
    count: count,
    headers: headers
  }
}

/* Block Data
 * Doc => https://en.bitcoin.it/wiki/Protocol_documentation#block
 */
var block = (raw) => {

}

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

module.exports = {
  writer: {
    version: version,
    verack: verack,
    address: address,
    getHeaders: getHeaders,
    getData: getData,
    inventory: inventory,
    blockHeader: blockHeader
  },
  reader: {
    headers: headers,
    block: block
  }
}
