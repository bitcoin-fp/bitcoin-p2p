/* global describe, it */

var assert = require('assert')
var msgReader = require('../src/message-reader')

describe('Message Reader', function () {
  it('should be valid version message', function () {
    var msg = msgReader.read('F9BEB4D976657273696F6E000000000064000000E272980C62EA0000010000000000000011B2D05000000000010000000000000000000000000000000000FFFF00000000208D010000000000000000000000000000000000FFFF00000000208D3B2EB35D8CE617650F2F5361746F7368693A302E372E322FC03E0300')
    assert.deepEqual(msg.header, {command: 'version', payloadLength: 100})
    assert.deepEqual(msg.payload, {protocol: 60002, addrMe: '0.0.0.0', addrYou: '0.0.0.0', timestamp: 1355854353, blockHeight: 212672})
  })
})
