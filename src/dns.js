var peers = require('./peer')
var NETWORK = require('./const').NETWORK
var dns = require('dns')

var Promise = require('promise')
var dnsResolve4 = Promise.denodeify(dns.resolve4)

/* Default DNS seeds */
var dnsSeeds = ['bitseed.xf2.org', 'dnsseed.bluematt.me', 'seed.bitcoin.sipa.be', 'dnsseed.bitcoin.dashjr.org', 'seed.bitcoinstats.com']
var dnsTestnetSeeds = ['seed.tbtc.petertodd.org']

/* Resolve DNS to get peers' IP, then connect them */
var resolve = (network) => {
  var seeds = network === NETWORK.MAINNET ? dnsSeeds : dnsTestnetSeeds
  var seedsResolved = seeds.map((seed) => dnsResolve4(seed))
  seedsResolved.forEach((seedResolved) => seedResolved.then(peers.connect(network)).catch(console.log))
  return seedsResolved
}

module.exports = {
  resolve: resolve
}
