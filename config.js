module.exports = {
    env: 'dev',
    applicationUrl: 'http://localhost',
    port: {
        http: 3000,
        https: 443
    },
    loggingMode: 'error',
    redisConfig: {
        host: '127.0.0.1',
        port: 6379
    },
    databaseConnection: {
        connectionLimit: 100,
        host     : '127.0.0.1',
        user     : 'root',
        password : 'root',
        database : 'db2'
    }
};
