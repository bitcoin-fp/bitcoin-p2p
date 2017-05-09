/* global describe, it */

var assert = require('assert')
var dns = require('../src/dns')

var Promise = require('promise')

describe('DNS Seeds Resolve', function () {
  it('should resolve Testnet DNS seeds', function () {
    Promise.all(dns.resolve('testnet')).then(function (seedsResolved) {
      assert.strictEqual(seedsResolved.length, 1)
    })
  })
})
