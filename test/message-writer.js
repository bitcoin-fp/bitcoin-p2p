/* global describe, it */

var assert = require('assert')
var msgWriter = require('../src/message-writer')

describe('Message Writer', function () {
  it('should be vaild IP address message', function () {
    // [data sample] https://en.bitcoin.it/wiki/Protocol_documentation#Network_address
    var ip = msgWriter.address('10.0.0.1', 8333)
    assert.strictEqual(ip.toString('hex').toUpperCase(), '010000000000000000000000000000000000FFFF0A000001208D')
  })

  it('should be vaild version message', function () {
    // [data sample] https://en.bitcoin.it/wiki/Protocol_documentation#version, different port = 8333 instead of 0
    var nodeId = Buffer.from('3B2EB35D8CE61765', 'hex')
    var version = msgWriter.version({protocol: 60002, addrMe: '0.0.0.0', addrYou: '0.0.0.0', network: 'mainnet', timestamp: 1355854353, nodeId: nodeId, blockHeight: 212672})
    assert.strictEqual(version.toString('hex').toUpperCase(), 'F9BEB4D976657273696F6E000000000064000000E272980C62EA0000010000000000000011B2D05000000000010000000000000000000000000000000000FFFF00000000208D010000000000000000000000000000000000FFFF00000000208D3B2EB35D8CE617650F2F5361746F7368693A302E372E322FC03E0300')
  })

  it('should be vaild verack message', function () {
    // [data sample] https://en.bitcoin.it/wiki/Protocol_documentation#verack
    var verack = msgWriter.verack({network: 'mainnet'})
    assert.strictEqual(verack.toString('hex').toUpperCase(), 'F9BEB4D976657261636B000000000000000000005DF6E0E2')
  })

  it('should be valid getheaders message', function () {
    // [data sample] https://bitcoin.org/en/developer-guide#headers-first
    var getheaders = msgWriter.getHeaders({protocol: 70002, network: 'mainnet'})
    assert.strictEqual(getheaders.toString('hex').toUpperCase(), 'F9BEB4D967657468656164657273000045000000F5FCBCAD72110100016FE28C0AB6F1B372C1A6A246AE63F74F931E8365E15A089C68D61900000000000000000000000000000000000000000000000000000000000000000000000000')
  })

  it('should be valid inventory message', function () {
    var inv = msgWriter.inventory('000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f')
    assert.strictEqual(inv.toString('hex').toUpperCase(), '020000006FE28C0AB6F1B372C1A6A246AE63F74F931E8365E15A089C68D6190000000000')
  })

  it('should be valid getdata message', function () {
    // needs data sample
  })

  it('should be valid blockheader message', function () {
    // needs data sample
  })
})
