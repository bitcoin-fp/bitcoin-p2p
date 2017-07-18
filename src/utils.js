var crypto = require('crypto')
var R = require('ramda')

var sha256 = (data) => crypto.createHash('sha256').update(data).digest()

var dsha256 = (data) => sha256(sha256(data))

var prefixBy = (what) => (to) => {
  var bWhat = Buffer.from(what)
  var payload = Buffer.concat([bWhat, to], bWhat.length + to.length)
  return payload
}

var prefixTo = (to) => (what) => {
  var bWhat = Buffer.from(what)
  var payload = Buffer.concat([bWhat, to], bWhat.length + to.length)
  return payload
}

var suffixBy = (what) => (to) => {
  var bWhat = Buffer.from(what)
  var payload = Buffer.concat([to, bWhat], to.length + bWhat.length)
  return payload
}

var slice = (start, end) => (buf) => buf.slice(start, end)

var suffixTo = (to) => (what) => {
  var bWhat = Buffer.from(what)
  var payload = Buffer.concat([to, bWhat], to.length + bWhat.length)
  return payload
}

var intToHex = (integer) => {
  var hex = (integer).toString(16)
  hex = hex.length % 2 === 0 ? '0x' + hex : '0x0' + hex
  return hex
}

var hexToInt = (hex) => parseInt('0x' + hex)

var writeUIntBE = (length) => (integer) => {
  var b = Buffer.alloc(length, 0)
  b.writeUIntBE(Buffer.from(intToHex(integer)), 0, length)
  return b
}

var writeUIntLE = (length) => (integer) => {
  var b = Buffer.alloc(length, 0)
  b.writeUIntLE(Buffer.from(intToHex(integer)), 0, length)
  return b
}

var readUIntLE = (length) => (buf) => {
  return buf.readUIntLE(0, length)
}

var writeVarInt = (integer) => {
  var uintWriter
  if (integer <= 253) {
    uintWriter = writeUIntLE(1)
  } else if (integer <= 65535) {
    uintWriter = R.compose(prefixBy([0xFD]), writeUIntLE(2))
  } else if (integer <= 4294967295) {
    uintWriter = R.compose(prefixBy([0xFE]), writeUIntLE(4))
  } else {
    uintWriter = R.compose(prefixBy([0xFF]), writeUIntLE(8))
  }
  return uintWriter(integer)
}

var readVarInt = (buf) => {
  var isStartedFD = bufferStartsWith(Buffer.from([0xFD]))
  var isStartedFE = bufferStartsWith(Buffer.from([0xFE]))
  var isStartedFF = bufferStartsWith(Buffer.from([0xFF]))
  var varint = buf
  if (isStartedFD(buf) || isStartedFE(buf) || isStartedFF(buf)) {
    varint = buf.slice(1, buf.length)
  }
  var n = hexToInt(reverseHex(varint.toString('hex')))
  return n
}

var bufferStartsWith = (target) => (buf) => buf.compare(target, 0, 1, 0, 1) === 0

var reverseHex = (hex) => hex.match(/.{2}/g).reverse().join('')

var bufferConcat = (chunks) => {
  var msg = Buffer.alloc(0)
  chunks.forEach((buf) => {
    msg = suffixBy(buf)(msg)
  })
  return msg
}

var trimNullPadded = (string) => string.replace(/\0/g, '')

var bufferToString = (buf) => buf.toString()

var bufferToHexString = (buf) => buf.toString('hex')

var blockHash = (blockHeader) => dsha256(Buffer.from(blockHeader.version + blockHeader.prev_block + blockHeader.merkle_root + blockHeader.timestamp + blockHeader.bits + blockHeader.nonce, 'hex'))

module.exports = {
  dsha256: dsha256,
  prefixBy: prefixBy,
  prefixTo: prefixTo,
  suffixBy: suffixBy,
  suffixTo: suffixTo,
  slice: slice,
  writeUIntBE: writeUIntBE,
  writeUIntLE: writeUIntLE,
  readUIntLE: readUIntLE,
  writeVarInt: writeVarInt,
  readVarInt: readVarInt,
  bufferStartsWith: bufferStartsWith,
  reverseHex: reverseHex,
  bufferConcat: bufferConcat,
  trimNullPadded: trimNullPadded,
  bufferToString: bufferToString,
  bufferToHexString: bufferToHexString,
  blockHash: blockHash
}
