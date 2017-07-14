var utils = require('./utils')
var R = require('ramda')

// var readMagic = R.compose(utils.bufferToString, utils.slice(0, 4))
var readCmd = R.compose(utils.trimNullPadded, utils.bufferToString, utils.slice(4, 16))
var readPayloadLength = R.compose(utils.readVarInt, utils.slice(16, 20))
var readPayloadChecksum = R.compose(utils.bufferToHexString, utils.slice(20, 24))

var readHeader = (data) => {
  return {
    command: readCmd(data),
    payloadLength: readPayloadLength(data),
    payloadChecksum: readPayloadChecksum(data)
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

var readBlockVersion = R.compose(utils.readUIntLE(4), utils.slice(0, 4))
var readPrevBlock = R.compose(utils.reverseHex, utils.bufferToHexString, utils.slice(4, 36))
var readMerkleRoot = R.compose(utils.reverseHex, utils.bufferToHexString, utils.slice(36, 68))
var readTimestamp4 = R.compose(utils.readUIntLE(4), utils.slice(68, 72))
var readDifficulty = R.compose(utils.readUIntLE(4), utils.slice(72, 76))
var readBits = R.compose(utils.readUIntLE(4), utils.slice(76, 80))
var readTxnCount = R.compose(utils.readUIntLE(1), utils.slice(80, 81))

var readBlockHeader = (hex) => {
  var header = Buffer.from(hex, 'hex')
  return {
    version: readBlockVersion(header),
    prev_block: readPrevBlock(header),
    merkle_root: readMerkleRoot(header),
    timestamp: readTimestamp4(header),
    difficulty: readDifficulty(header),
    bits: readBits(header),
    txn_count: readTxnCount(header)
  }
}

var readPayload = (command) => (data) => {
  var readers = {
    'version': (data) => {
      if (data.length === 0) return
      return {
        protocol: readProtocol(data),
        timestamp: readTimestamp(data),
        addrYou: readAddrYou(data).address,
        addrMe: readAddrMe(data).address,
        blockHeight: readBlockHeight(data)
      }
    },
    'verack': (data) => {},
    'headers': (data) => {
      var isStartedFD = utils.bufferStartsWith(Buffer.from([0xFD]))
      var isStartedFE = utils.bufferStartsWith(Buffer.from([0xFE]))
      var isStartedFF = utils.bufferStartsWith(Buffer.from([0xFF]))
      var bInt
      var bHeaders
      if (isStartedFF(data)) {
        bInt = data.slice(0, 9)
        bHeaders = data.slice(9)
      } else if (isStartedFE(data)) {
        bInt = data.slice(0, 5)
        bHeaders = data.slice(5)
      } else if (isStartedFD(data)) {
        bInt = data.slice(0, 3)
        bHeaders = data.slice(3)
      } else {
        bInt = data.slice(0, 1)
        bHeaders = data.slice(1)
      }
      var count = utils.readVarInt(bInt)
      var headers = bHeaders.toString('hex').match(/.{162}/g).map(readBlockHeader)

      return {
        count: count,
        headers: headers
      }
    },
    'ping': (data) => {
      return {nonce: utils.readUIntLE(8)(data)}
    },
    'addr': (data) => {
      return {}
    }
  }
  return readers[command] ? readers[command](data) : null
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
