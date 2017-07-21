var BLOCK0 = require('./const').GENESIS_BLOCK

var blockchain = [BLOCK0]

var addBlock = (block) => blockchain.unshift(block)

var getHighestBlock = () => blockchain[0]

var getBlockchain = () => blockchain

var getLength = () => blockchain.length

var getGenesisBlock = () => blockchain[blockchain.length - 1]

module.exports = {
  addBlock: addBlock,
  getHighestBlock: getHighestBlock,
  getBlockchain: getBlockchain,
  getLength: getLength,
  getGenesisBlock: getGenesisBlock
}
