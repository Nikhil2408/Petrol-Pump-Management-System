var sessionUtils = require('../utils/sessionUtils');
var util=require('util');
var databaseUtils=require('./../utils/databaseUtils');


module.exports = {
showfuelReceipt: function*(next){
    var fuelReceiptqueryString='select * from fuel_receipt f,transport t where f.tid=t.id';
    var fuelReceiptquery=util.format(fuelReceiptqueryString);
    var result=yield databaseUtils.executeQuery(fuelReceiptquery);
    var fuelDetails=result;
    yield this.render('fuelReceipt',{
        fuelDetails:fuelDetails
    });
},
}