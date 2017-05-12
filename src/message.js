var utils = require('./utils')
var PORT = require('./const').PORT
var crypto = require('crypto')

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

var version = (opts) => {
  var ver = Buffer.alloc(0)

  var protocol = utils.writeUIntLE(4)(60002)
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

  return ver
}

module.exports = {
  version: version,
  address: address
}
