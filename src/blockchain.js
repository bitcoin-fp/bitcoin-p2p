var level = require('level')
var thenlevel = require('then-levelup')
var writeLog = require('./logger').loghs

var headersDB = null

var topHeight = 0

var BLOCK0 = require('./const').GENESIS_BLOCK

var addBlockHeaders = (headers) => {
  return headers.reduce((promise, header) => { // sequential promise execution
    return promise.then(() => {
      var ops = [
        {type: 'put', key: 'top_height', value: topHeight + 1},
        {type: 'put', key: topHeight + 1, value: header}
      ]
      return headersDB.batch(ops)
      .then(() => {
        topHeight++
        writeLog('Header [' + topHeight + '] added: ' + header.hash)
        return topHeight
      })
      .catch((err) => writeLog('[Error] Fail in adding block header.'))
    })
  }, Promise.resolve())
}

var getBlockHeader = (index) => headersDB.get(index)

var getBlockHash = (index) => getBlockHeader(index).then((header) => header.hash)

var getLength = () => topHeight + 1

var getGenesisBlockHeader = () => getBlockHeader(0)

var getGenesisBlockHeaderHash = () => getBlockHash(0)

var getHighestBlockHeader = () => getBlockHeader(topHeight)

var getHighestBlockHeaderHash = () => getBlockHash(topHeight)

var getLocatorObjects = () => {
  var indexes = []
  var step = 1
  for (var i = topHeight; i > 0; i -= step) {
    indexes.push(i)
    if (indexes.length >= 10) step *= 2
  }
  indexes.push(0)

  return Promise.all(indexes.map(getBlockHash)).then((blockHashes) => {
    return blockHashes
  }).catch(console.log)
}

var init = (location) => {
  headersDB = thenlevel(level(location, {valueEncoding: 'json'}))

  return headersDB.get('top_height')
  .then((value) => {
    topHeight = value
    return topHeight
  })
  .catch((err) => {
    var ops = [
      {type: 'put', key: 'top_height', value: topHeight},
      {type: 'put', key: 0, value: BLOCK0}
    ]
    return headersDB.batch(ops)
    .then(() => {
      console.log('Headers DB init done.')
      return topHeight
    })
    .catch((err) => console.log('Headers DB init fail'))
  })
}

module.exports = {
  addBlockHeaders: addBlockHeaders,
  getHighestBlockHeader: getHighestBlockHeader,
  getHighestBlockHeaderHash: getHighestBlockHeaderHash,
  getLength: getLength,
  getBlockHeader: getBlockHeader,
  getBlockHash: getBlockHash,
  getGenesisBlockHeader: getGenesisBlockHeader,
  getGenesisBlockHeaderHash: getGenesisBlockHeaderHash,
  getLocatorObjects: getLocatorObjects,
  init: init
}
