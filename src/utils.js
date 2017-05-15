var crypto = require('crypto')

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

module.exports = {
  dsha256: dsha256,
  prefixBy: prefixBy,
  prefixTo: prefixTo,
  suffixBy: suffixBy,
  suffixTo: suffixTo,
  slice: slice,
  writeUIntBE: writeUIntBE,
  writeUIntLE: writeUIntLE
}