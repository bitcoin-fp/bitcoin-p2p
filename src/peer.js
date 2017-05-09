var net = require('net')

var peerConnection = (ip) => {
  return new Promise((resolve, reject) => {
    var client = net.connect({
      port: 18333,
      host: ip
    }, () => {
      console.log('peer ' + ip + ' connected')
      resolve()
    })

    client.on('error', (err) => {
      console.log('peer ' + ip + ' connect fail')
      console.log(err)
      reject(err)
    })
  })
}

var allPeersConnected = (peers) => {
  console.log('All ' + peers.length + ' peers connected!')
}

var connect = (ips) => {
  var allPeersConnection = ips.map(peerConnection)
  Promise.all(allPeersConnection).then(allPeersConnected).catch(console.log)
  return allPeersConnection
}

module.exports = {
  connect: connect
}
