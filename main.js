var app = require('koa')();

var cors = require('koa-cors');
var mount = require('koa-mount');
var util = require('util');

var render = require('co-ejs');
var path = require('path');
var Constants = require('./constants');

var config = require('./config');
var logger = require('./logger');

var bodyParser = require('koa-body');

var sessionUtils = require('./utils/sessionUtils');
var databaseUtils = require('./utils/databaseUtils');
var redisUtils = require('./utils/redisUtils');

app.use(bodyParser({
    formidable: {uploadDir: './static/static/uploads'},
    multipart: true,
    urlencoded: true
}));

app.use(function* (next) {

    var sessionId = this.cookies.get("SESSION_ID");
    this.currentUser = yield sessionUtils.getCurrentUser(sessionId);

    var queryString, query, result;

    var locals = {
        currentUser: this.currentUser,
        title: 'Title of the application',
        description: 'Description of the application',
        metaImageUrl: "",
        canonicalUrl: "",
        utils: require('./ejsHelpers')
    };

    render(app, {
        root: path.join(__dirname, 'views'),
        layout: false,
        viewExt: 'html',
        cache: false,
        locals: locals,
        debug: false
    });
    
    yield next;
});

app.use(function* (next) {
    try {
        yield next;
    } catch (err) {
        this.type = 'json';
        err.url = this.request.url;
        logger.logError(err);
        this.status = err.status || 500;
        this.body = {'error': 'Some error occured'};
        this.app.emit('error', err, this);
    }
});

app.use(mount('/app', require('./routes/appRoutes')(app)));

var serve = require('koa-static');
app.use(serve('static'));

module.exports = app;

require('./clusterify')(app);
