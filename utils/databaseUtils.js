var config = require('./../config');
var mysql = require('mysql');
var logger = require('./../logger');
var thunkify = require('thunkify');

var pool  = mysql.createPool({
    connectionLimit : config.databaseConnection.connectionLimit,
    host            : config.databaseConnection.host,
    user            : config.databaseConnection.user,
    password        : config.databaseConnection.password,
    database        : config.databaseConnection.database
});

var executeQuery = function(query, callback) {
    pool.getConnection(function(err, connection) {
        // Use the connection
        connection.query(query, function(err, rows, fields) {
            connection.release();
            if(err) {
                err.mysqlQuery = query;
                logger.logError(err);
            }

            if(typeof callback == "function") {
                callback(err, rows);
            }
            // Don't use the connection here, it has been returned to the pool.
        });
    });
};

module.exports = {
    executeQuery: thunkify(executeQuery),
    executePlainQuery: executeQuery
};
