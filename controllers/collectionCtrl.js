var sessionUtils = require('../utils/sessionUtils');
var util=require('util');
var databaseUtils=require('./../utils/databaseUtils');


module.exports = {
showicollectionPage: function* (next) {
    var pid;
    try{ pid=this.currentUser[0].PID;}
    catch(e){pid=0;}

    var queryString='SELECT MODE FROM COLLECTION_MODE WHERE PID=%s';
   var query=util.format(queryString,pid);

   var collectiontype=yield databaseUtils.executeQuery(query);

    yield this.render('icollectionmode',{
        
        collectiontype:collectiontype
});
},
showicollection2Page: function* (next) {


    var pid;
    try{ pid=this.currentUser[0].PID;}
    catch(e){pid=0;}
    var mode=this.request.body.mode;
    var queryString='INSERT INTO COLLECTION_MODE(PID,MODE) VALUES(%s,"%s")';
    var query=util.format(queryString,pid,mode);
    var collectionresult=yield databaseUtils.executeQuery(query);
    var modee=collectionresult.insertId;
    var res=yield databaseUtils.executeQuery(util.format('INSERT INTO BALANCE (CRDB,BAL,PID,MODE,SID) VALUES(%s,%s,%s,%s,0)',0,0,pid,modee));
    this.redirect('icollectionmode');

},
}

