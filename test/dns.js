/* global describe, it */

var assert = require('assert')
var dns = require('../src/dns')
var NETWORK = require('../src/const').NETWORK

var Promise = require('promise')

describe('DNS Seeds Resolve', function () {
  it('should resolve Testnet DNS seeds', function () {
    return Promise.all(dns.resolve(NETWORK.TESTNET)).then(function (seedsResolved) {
      assert.strictEqual(seedsResolved.length, 1)
    })
  })
  it('should resolve Mainnet DNS seeds', function () {
    return Promise.all(dns.resolve(NETWORK.MAINNET)).then(function (seedsResolved) {
      assert.strictEqual(seedsResolved.length, 5)
    })
  })
})
