/* global describe, it */

var assert = require('assert')
var message = require('../src/message')

var crypto = require('crypto')

describe('Message', function () {
  it('should be vaild IP address', function () {
    var ip = message.address('10.0.0.1', 8333)
    assert.strictEqual(ip.toString('hex').toUpperCase(), '010000000000000000000000000000000000FFFF0A000001208D')
  })

  it('should be vaild version', function () {
    var nodeId = crypto.randomBytes(8)
    var version = message.version({addrMe: '0.0.0.0', addrYou: '0.0.0.0', network: 'mainnet', timestamp: 1355854353, nodeId: nodeId, blockHeight: 212672})
    assert.strictEqual(version.toString('hex').toUpperCase(), '62EA0000010000000000000011B2D05000000000010000000000000000000000000000000000FFFF00000000208D010000000000000000000000000000000000FFFF00000000208D' + nodeId.toString('hex').toUpperCase() + '0F2F5361746F7368693A302E372E322FC03E0300')
  })
})
