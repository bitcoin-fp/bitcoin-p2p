var fs = require('fs')
var Console = require('console').Console
var moment = require('moment')

var connOutput = fs.createWriteStream('./log/socket.log')
var connLogger = new Console(connOutput);
var logConn = (msg) => connLogger.log('%s %s', moment().format(), msg)

var headerSyncOutput = fs.createWriteStream('./log/headersync.log')
var headerSyncLogger = new Console(headerSyncOutput)
var logHeaderSync = (msg) => headerSyncLogger.log('%s %s', moment().format(), msg)

module.exports = {
  logsc: logConn,
  loghs: logHeaderSync
}
