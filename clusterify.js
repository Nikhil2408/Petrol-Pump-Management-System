var cluster = require('cluster');
var config = require('./config');
var http = require('http');
var fs = require('fs');
var os = require('os');
var logger = require('./logger');

module.exports = function(app) {
    if(cluster.isMaster) {
        var numWorkers = os.cpus().length;

        for(var i = 0; i < numWorkers; i++) {
            cluster.fork();
        }

        cluster.on('exit', function(worker, code, signal) {
            logger.logError('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
            cluster.fork();
        });
    } else {
        http.createServer(app.callback()).listen(config.port.http);
    }
}
