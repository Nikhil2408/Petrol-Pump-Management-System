var winston = require('winston');
var config = require('./config');

winston.level = config.loggingMode;

winston.add(winston.transports.DailyRotateFile, {
    name: 'error-file',
    datePattern: '.yyyy-MM-dd',
    handleExceptions: true,
    humanReadableUnhandledException: true,
    maxsize: 2000000,
    filename: __dirname + "/logs/" + "log",
    level: 'error'
});

winston.add(winston.transports.DailyRotateFile, {
    name: 'info-file',
    datePattern: '.yyyy-MM-dd',
    handleExceptions: true,
    humanReadableUnhandledException: true,
    maxsize: 2000000,
    filename: __dirname + "/logs/" + "log",
    level: 'info'
});

winston.remove(winston.transports.Console);

module.exports = {
    logError: function(err) {
        winston.error(err, err.stack);
    },

    logInfo: function(message) {
        winston.info(message);
    }
};
