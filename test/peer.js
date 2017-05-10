/* global describe, it */

var assert = require('assert')
var peer = require('../src/peer')
var NETWORK = require('../src/const').NETWORK

var Promise = require('promise')

describe('Peers', function () {
  it('should connect to 1 peer on Testnet', function () {
    var peersConnectPromised = peer.connect(NETWORK.TESTNET)(['168.63.245.221'])
    return Promise.all(peersConnectPromised).then(function (conns) {
      assert.strictEqual(conns.length, 1)
    })
  })
  it('should connect to 1 peer on Mainnet', function () {
    var peersConnectPromised = peer.connect(NETWORK.MAINNET)(['185.50.213.123'])
    return Promise.all(peersConnectPromised).then(function (conns) {
      assert.strictEqual(conns.length, 1)
    })
  })
})
