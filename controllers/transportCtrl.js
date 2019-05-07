var sessionUtils = require('../utils/sessionUtils');
var util=require('util');
var databaseUtils=require('./../utils/databaseUtils');


module.exports = {
showTransport: function*(next){
    var transportqueryString='select * from transport';
    var transportquery=util.format(transportqueryString);
    var result=yield databaseUtils.executeQuery(transportquery);
    var transportDetails=result;
    yield this.render('transport',{
       transportDetails:transportDetails
    });
},
showTransport2 :function*(next){

    var pid;
    try{ pid=this.currentUser[0].PID;}
    catch(e){pid=0;}
    var name=this.request.body.name;
    var tp=this.request.body.tp;
    if(tp=='1'){
        var re=yield databaseUtils.executeQuery(util.format('INSERT INTO TRANSPORT (PID,NAME) VALUES(%s,"%s")',pid,name));
    }
    this.redirect('/transport');
},
}