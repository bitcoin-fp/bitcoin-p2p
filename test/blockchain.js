/* global describe, it */

var assert = require('assert')
var bc = require('../src/blockchain')

var rimraf = require('rimraf')
var Promise = require('promise')

describe('Headers of Blockchain', function () {
  var location = './test/db/headers'

  before(function () {
    rimraf.sync(location) // delete db
  })

  it('should init blockchain', function () {
    return bc.init(location).then(function (topHeight) {
      assert.strictEqual(topHeight, 0)
    })
  })

  it('should be correct length', function () {
    assert.strictEqual(bc.getLength(), 1)
  })

  it('should be correct genesis block header', function () {
    return bc.getGenesisBlockHeader().then(function (header) {
      assert.deepEqual(header, {hash: '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f'})
    })
  })

  it('should be correct genesis block hash', function () {
    return bc.getGenesisBlockHeaderHash().then(function (hash) {
      assert.strictEqual(hash, '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f')
    })
  })

  it('should add a 9 block headers', function () {
    var headers = [
      {hash: '001'},
      {hash: '002'},
      {hash: '003'},
      {hash: '004'},
      {hash: '005'},
      {hash: '006'},
      {hash: '007'},
      {hash: '008'},
      {hash: '009'}
    ]
    return bc.addBlockHeaders(headers).then(function () {
      assert.strictEqual(bc.getLength(), 10)
    })
  })

  it('should be correct one block header', function () {
    return bc.getBlockHeader(5).then(function (header) {
      assert.deepEqual(header, {hash: '005'})
    })
  })

  it('should be correct one block hash', function () {
    return bc.getBlockHash(5).then(function (hash) {
      assert.strictEqual(hash, '005')
    })
  })

  it('should be correct top block header after adding block headers', function () {
    return bc.getHighestBlockHeader().then(function (header) {
      assert.deepEqual(header, {hash: '009'})
    })
  })

  it('should be correct top block hash after adding block headers', function () {
    return bc.getHighestBlockHeaderHash().then(function (hash) {
      assert.strictEqual(hash, '009')
    })
  })

  it('should be correct locator objects after adding block headers', function () {
    // assert.strictEqual(, )
  })
})
