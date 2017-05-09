var peers = require('./peer')
var dns = require('dns')

var Promise = require('promise')
var dnsResolve4 = Promise.denodeify(dns.resolve4)

var dnsSeeds = ['bitseed.xf2.org', 'dnsseed.bluematt.me', 'seed.bitcoin.sipa.be', 'dnsseed.bitcoin.dashjr.org', 'seed.bitcoinstats.com']
var dnsTestnetSeeds = ['seed.tbtc.petertodd.org']

var resolve = (network) => {
  var seeds = network === 'mainnet' ? dnsSeeds : dnsTestnetSeeds
  var seedsResolved = seeds.map((seed) => dnsResolve4(seed))
  seedsResolved.forEach((seedResolved) => seedResolved.then(peers.connect).catch(console.log))
  return seedsResolved
}

module.exports = {
  resolve: resolve
}
