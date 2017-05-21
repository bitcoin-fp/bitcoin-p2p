/* global describe, it */

var assert = require('assert')
var utils = require('../src/utils')

describe('Utils', function () {
  describe('varint writer', function () {
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

  describe('varint reader', function () {
    it('<= 253', function () {
      var i = utils.readVarInt(Buffer.from('01', 'hex'))
      assert.strictEqual(i, 1)
    })
    it('<= 65535', function () {
      var i = utils.readVarInt(Buffer.from('FD60EA', 'hex'))
      assert.strictEqual(i, 60000)
    })
    it('<= 4294967295', function () {
      var i = utils.readVarInt(Buffer.from('FEFEFFFFFF', 'hex'))
      assert.strictEqual(i, 4294967294)
    })
  })

  describe('function bufferStartsWith', function () {
    it('should be true', function () {
      var buf = Buffer.from([0xFE, 0x02])
      var target = Buffer.from([0xFE])
      assert.strictEqual(utils.bufferStartsWith(target)(buf), true)
    })
    it('should be false', function () {
      var buf = Buffer.from([0xFE, 0x02])
      var target = Buffer.from([0x00])
      assert.strictEqual(utils.bufferStartsWith(target)(buf), false)
    })
  })
})
