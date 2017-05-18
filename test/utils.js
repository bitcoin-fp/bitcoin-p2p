/* global describe, it */

var assert = require('assert')
var utils = require('../src/utils')

describe('Utils', function () {
  describe('should be vaild varint writer', function () {
    it('<= 253', function () {
      var buf = utils.writeVarInt(1)
      assert.strictEqual(buf.toString('hex').toUpperCase(), '01')
    })
    it('<= 65535', function () {
      var buf = utils.writeVarInt(60000)
      assert.strictEqual(buf.toString('hex').toUpperCase(), 'FD60EA')
    })
    it('<= 4294967295', function () {
      var buf = utils.writeVarInt(4294967294)
      assert.strictEqual(buf.toString('hex').toUpperCase(), 'FEFEFFFFFF')
    })
  })
})
