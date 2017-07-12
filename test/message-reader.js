/* global describe, it */

var assert = require('assert')
var msgReader = require('../src/message-reader')

describe('Message Reader', function () {
  it('should be valid version message of 60002 protocol', function () {
    var msg = msgReader.read('F9BEB4D976657273696F6E000000000064000000E272980C62EA0000010000000000000011B2D05000000000010000000000000000000000000000000000FFFF00000000208D010000000000000000000000000000000000FFFF00000000208D3B2EB35D8CE617650F2F5361746F7368693A302E372E322FC03E0300')
    assert.deepEqual(msg.header, {command: 'version', payloadLength: 100})
    assert.deepEqual(msg.payload, {protocol: 60002, addrMe: '0.0.0.0', addrYou: '0.0.0.0', timestamp: 1355854353, blockHeight: 212672})
  })
  it('should be valid version message of 70015 protocol', function () {
    var msg = msgReader.read('f9beb4d976657273696f6e000000000084000000afa25c0e7f1101000d00000000000000c3c4655900000000000000000000000000000000000000000000ffff3cf8834ef9220d00000000000000000000000000000000000000000000000000b6e6f476b18c9c722e2f5361746f7368693a302e31342e32286e6f2d737962696c2d7369676e616c2d646572706167652d6b746878292f2341070001f9beb4d976657261636b000000000000000000005df6e0e2')
    assert.deepEqual(msg.header, {command: 'version', payloadLength: 132})
    assert.deepEqual(msg.payload, {protocol: 70015, addrMe: '0.0.0.0', addrYou: '60.248.131.78', timestamp: 1499841731, blockHeight: 475427})
  })
})
