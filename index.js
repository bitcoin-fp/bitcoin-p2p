var dns = require('./src/dns')
var peer = require('./src/peer')
var Blockchain = require('./src/blockchain')

Blockchain.init('./db/headers').then(function (topHeight) {
  console.log('Bitcoin p2p network started. The local node has %d block(s).', topHeight)
  dns.resolve('mainnet')
  // peer.buildPool('mainnet')(['104.237.2.189', '13.73.0.61']) // node for test
})
