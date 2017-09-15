var peer = require('./src/peer')
var Blockchain = require('./src/blockchain')

Blockchain.init('./db/headers').then(function (topHeight) {
  // dns.resolve('mainnet')
  console.log('Bitcoin p2p network started. The local node has %d block(s).', topHeight)
  peer.buildPool('mainnet')(['104.237.2.189'])
})
