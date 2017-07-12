var utils = require('./utils')
var R = require('ramda')

// var readMagic = R.compose(utils.bufferToString, utils.slice(0, 4))
var readCmd = R.compose(utils.trimNullPadded, utils.bufferToString, utils.slice(4, 16))
var readPayloadLength = R.compose(utils.readVarInt, utils.slice(16, 20))
// var readPayloadChecksum = R.compose(utils.slice(20, 24))

var readHeader = (data) => {
  return {
    command: readCmd(data),
    payloadLength: readPayloadLength(data)
  }
}

var readProtocol = R.compose(utils.readUIntLE(4), utils.slice(0, 4))
// var readService = R.compose(utils.readUIntLE(8), utils.slice(4, 12))
var readTimestamp = R.compose(utils.readUIntLE(8), utils.slice(12, 20))
var readAddress = (addr) => {
  var readIp1 = R.compose(utils.readUIntLE(1), utils.slice(20, 21))
  var readIp2 = R.compose(utils.readUIntLE(1), utils.slice(21, 22))
  var readIp3 = R.compose(utils.readUIntLE(1), utils.slice(22, 23))
  var readIp4 = R.compose(utils.readUIntLE(1), utils.slice(23, 24))
  var ipReaders = [readIp1, readIp2, readIp3, readIp4]
  var ips = ipReaders.map((reader) => reader(addr))
  var readPort = R.compose(utils.readUIntLE(1), utils.slice(24, 26))
  return {
    address: ips.join('.'),
    port: readPort(addr)
  }
}
var readAddrYou = R.compose(readAddress, utils.slice(20, 46))
var readAddrMe = R.compose(readAddress, utils.slice(46, 72))
// var readNodeId = R.compose(utils.readUIntLE(8), utils.slice(72, 80))
// var readSubverLength = R.compose(utils.readUIntLE(1), utils.slice(80, 81))
// var readSubver = (data) => {
//   var subverLength = readSubverLength(data)
//   return R.compose(utils.bufferToString, utils.slice(81, 81 + subverLength))(data)
// }
var readBlockHeight = (data) => {
  var reader = readProtocol(data) >= 70001 ? R.compose(utils.readUIntLE(4), utils.slice(-5, -1)) : R.compose(utils.readUIntLE(4), utils.slice(-4))
  return reader(data)
}

var readPayload = (command) => (data) => {
  var readers = {
    'version': (data) => {
      return {
        protocol: readProtocol(data),
        timestamp: readTimestamp(data),
        addrYou: readAddrYou(data).address,
        addrMe: readAddrMe(data).address,
        blockHeight: readBlockHeight(data)
      }
    }
  }
  return readers[command](data)
}

var read = (data) => {
  var buf = Buffer.from(data, 'hex')
  var header = readHeader(buf)
  var payload = readPayload(header.command)(utils.slice(24, 24 + header.payloadLength)(buf))
  return {
    header: header,
    payload: payload
  }
}

module.exports = {
  read: read
}
