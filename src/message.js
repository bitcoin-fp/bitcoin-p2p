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
  var addr = Buffer.alloc(0)

  var service = Buffer.from([0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])
  var ipHex = ip.split('.').map((digi) => '0x' + utils.writeUIntBE(1)(parseInt(digi)).toString('hex'))
  var bIpv4 = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xff].concat(ipHex))
  var bPort = utils.writeUIntBE(2)(port)

  var chunks = [service, bIpv4, bPort]
  chunks.forEach((buf) => {
    addr = utils.suffixBy(buf)(addr)
  })

  return addr
}

/* Version
 * Doc => https://en.bitcoin.it/wiki/Protocol_documentation#version
 */
var version = (opts) => {
  var ver = Buffer.alloc(0)

  var protocol = utils.writeUIntLE(4)(opts.protocol)
  var service = Buffer.from([0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])
  var timestamp = utils.writeUIntLE(8)(opts.timestamp ? opts.timestamp : new Date().getTime())
  var addrYou = address(opts.addrYou, PORT[opts.network.toUpperCase()])
  var addrMe = address(opts.addrMe, PORT[opts.network.toUpperCase()])
  var nodeId = opts.nodeId ? opts.nodeId : crypto.randomBytes(8)
  var subverLength = utils.writeUIntLE(1)('/Satoshi:0.7.2/'.length)
  var subver = Buffer.from('/Satoshi:0.7.2/')
  var blockHeight = utils.writeUIntLE(4)(opts.blockHeight)

  var chunks = [protocol, service, timestamp, addrYou, addrMe, nodeId, subverLength, subver, blockHeight]
  chunks.forEach((buf) => {
    ver = utils.suffixBy(buf)(ver)
  })

  var header = addMessageHeader(opts.network, 'version', ver)
  ver = utils.prefixBy(header)(ver)

  return ver
}

/* Verack
 * Doc => https://en.bitcoin.it/wiki/Protocol_documentation#verack
 */
var verack = (opts) => {
  var verack = Buffer.alloc(0)
  return addMessageHeader(opts.network, 'verack', verack)
}

/* Get Headers
 * Doc => https://en.bitcoin.it/wiki/Protocol_documentation#getheaders
 */
var getHeaders = (opts) => {
  var msg = Buffer.alloc(0)

  var protocol = utils.writeUIntLE(4)(opts.protocol)
  var hashCount = utils.writeUIntLE(1)(1)
  var highestBlock = Blockchain.getHighestBlock()
  var highestBlockHash = Buffer.from(utils.reverseHex(highestBlock.hash), 'hex')
  var hashStop = Buffer.alloc(32)

  var chunks = [protocol, hashCount, highestBlockHash, hashStop]
  chunks.forEach((buf) => {
    msg = utils.suffixBy(buf)(msg)
  })

  var header = addMessageHeader(opts.network, 'getheaders', msg)
  msg = utils.prefixBy(header)(msg)

  return msg
}

/* Get Data
 * Doc => https://en.bitcoin.it/wiki/Protocol_documentation#getdata
 */
var getData = (opts) => {

}

/* Headers Data
 * Doc => https://en.bitcoin.it/wiki/Protocol_documentation#headers
 */
var headers = (headers) => {

}

/* Block Data
 * Doc => https://en.bitcoin.it/wiki/Protocol_documentation#block
 */
var block = (block) => {

}

/* Message Header
 * Doc => https://en.bitcoin.it/wiki/Protocol_documentation#Message_structure
 */
var addMessageHeader = (network, command, payload) => {
  var header = Buffer.alloc(0)

  var magic = Buffer.from(Magic[network.toUpperCase()])
  var cmd = Buffer.from(Command[command.toUpperCase()])
  var payloadLength = utils.writeUIntLE(4)(payload.length)
  var PayloadChecksum = utils.slice(0, 4)(utils.dsha256(payload))

  var chunks = [magic, cmd, payloadLength, PayloadChecksum]
  chunks.forEach((buf) => {
    header = utils.suffixBy(buf)(header)
  })

  return header
}

module.exports = {
  writer: {
    version: version,
    verack: verack,
    address: address,
    getHeaders: getHeaders,
    getData: getData
  },
  reader: {
    headers: headers,
    block: block
  }
}
