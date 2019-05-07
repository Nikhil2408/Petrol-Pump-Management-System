var sessionUtils = require('../utils/sessionUtils');

module.exports = {
    showTestpage: function* (next) {
        yield this.render('gla',{

        });
    }
}
