/* global describe, it */

var assert = require('assert')
var message = require('../src/message')

describe('Message', function () {
  it('should be vaild IP address message', function () {
    // https://en.bitcoin.it/wiki/Protocol_documentation#Network_address
    var ip = message.address('10.0.0.1', 8333)
    assert.strictEqual(ip.toString('hex').toUpperCase(), '010000000000000000000000000000000000FFFF0A000001208D')
  })

  it('should be vaild version message', function () {
    // https://en.bitcoin.it/wiki/Protocol_documentation#version, different port = 8333 instead of 0
    var nodeId = Buffer.from('3B2EB35D8CE61765', 'hex')
    var version = message.version({addrMe: '0.0.0.0', addrYou: '0.0.0.0', network: 'mainnet', timestamp: 1355854353, nodeId: nodeId, blockHeight: 212672})
    assert.strictEqual(version.toString('hex').toUpperCase(), 'F9BEB4D976657273696F6E000000000064000000E272980C62EA0000010000000000000011B2D05000000000010000000000000000000000000000000000FFFF00000000208D010000000000000000000000000000000000FFFF00000000208D3B2EB35D8CE617650F2F5361746F7368693A302E372E322FC03E0300')
  })

  it('should be vaild verack message', function () {
    // https://en.bitcoin.it/wiki/Protocol_documentation#verack
    var verack = message.verack({network: 'mainnet'})
    assert.strictEqual(verack.toString('hex').toUpperCase(), 'F9BEB4D976657261636B000000000000000000005DF6E0E2')
  })
})
