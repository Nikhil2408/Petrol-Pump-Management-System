var sessionUtils = require('../utils/sessionUtils');
var util=require('util');
var databaseUtils=require('./../utils/databaseUtils');

module.exports = {
    showiTankPage: function* (next) {
        var pid;
try{ pid=this.currentUser[0].PID;}
catch(e){pid=0;}


        var QueryString;
        var query;
        var ttype=this.request.query.ttype;
        var ttype;
        if((!ttype) || ttype=='All'){
            QueryString='SELECT ID,CAPACITY,TYPE,ACTIVE FROM TANK_METADATA WHERE PID=%s';
            query=util.format(QueryString,pid);
        }
        else{
            QueryString='SELECT ID,CAPACITY,TYPE,ACTIVE FROM TANK_METADATA WHERE PID=%s AND TYPE="%s"';
            query=util.format(QueryString,pid,ttype);
        }
        
        var DetailtankResult=yield databaseUtils.executeQuery(query);

        var QueryString='SELECT DISTINCT(TYPE) FROM TANK_METADATA WHERE PID=%s';
        var query=util.format(QueryString,pid);
        var tankType=yield databaseUtils.executeQuery(query);
        yield this.render('itank',{
            DetailtankResult:DetailtankResult,
            tankType:tankType,
            ttype:ttype,
    });
},
showiTank2Page: function* (next) {
    var pid;
    var tid=this.request.body.tid;
    var cap=this.request.body.capacity;
    var type=this.request.body.type;
    if(tid==undefined||cap==undefined||type==undefined){}
    else{
    var queryString='UPDATE TANK_METADATA SET CAPACITY=%s,TYPE="%s" WHERE ID=%s';
    var query=util.format(queryString,cap,type,tid);
    var res=yield databaseUtils.executeQuery(query);
    }

    try{
    var pid=this.request.body.pid;
    var cap=this.request.body.capacity;
    var type=this.request.body.type;
    var queryString='INSERT INTO TANK_METADATA (PID,CAPACITY,TYPE) \
    VALUES(%s,%s,"%s")';
    var query=util.format(queryString,pid,cap,type);
    var res=yield databaseUtils.executeQuery(query);
    }
    catch(e){
        var pid;
try{ pid=this.currentUser[0].PID;}
catch(e){pid=0;}

    }
    var DetailtankQueryString;
    var DetailtankQuery;
    var wf;
    try{
        var wf=this.request.body.ttype;
        if (wf=='all'){
            DetailtankQueryString='SELECT ID,CAPACITY,TYPE,ACTIVE FROM TANK_METADATA WHERE PID=%s';
            DetailtankQuery=util.format(DetailtankQueryString,pid);
        }
        else{
            DetailtankQueryString='SELECT ID,CAPACITY,TYPE,ACTIVE FROM TANK_METADATA WHERE PID=%s and TYPE="%s"';
            DetailtankQuery=util.format(DetailtankQueryString,pid,wf);
        }
    }
    catch(ee){
    }
    if(wf==undefined){
    DetailtankQueryString='SELECT ID,CAPACITY,TYPE,ACTIVE FROM TANK_METADATA WHERE PID=%s';
    DetailtankQuery=util.format(DetailtankQueryString,pid);
    }
    
    var DetailtankResult=yield databaseUtils.executeQuery(DetailtankQuery);
    
    

    var tankTypeQueryString='SELECT DISTINCT(TYPE) FROM TANK_METADATA WHERE PID=%s';
    var tankTypeQuery=util.format(tankTypeQueryString,pid);
    var tankType=yield databaseUtils.executeQuery(tankTypeQuery);

    this.redirect('itank');
},
showiTank3Page: function* (next) {
    var pid;
    try{ pid=this.currentUser[0].PID;}
catch(e){pid=0;}

    var queryString;
    var query;
    var tid;
    var cap=this.request.body.capacity;
    var type=this.request.body.type;
    console.log(this.request.body.tid);
    var act=this.request.body.tid.split(' ');

    if(parseInt(act[0])==1){
        var queryString='INSERT INTO TANK_METADATA (PID,CAPACITY,TYPE) \
        VALUES(%s,%s,"%s")';
        var query=util.format(queryString,pid,cap,type);
        var res=yield databaseUtils.executeQuery(query);
    }
    else if(parseInt(act[0])==2){
        var tid=parseInt(act[1]);
        var queryString='UPDATE TANK_METADATA SET CAPACITY=%s,TYPE="%s" WHERE ID=%s';
    var query=util.format(queryString,cap,type,tid);
    var res=yield databaseUtils.executeQuery(query);
    }
    else{
        var tid=parseInt(act[2]);
        if(parseInt(act[1])==0){
        var res=yield databaseUtils.executeQuery(util.format('UPDATE TANK_METADATA SET ACTIVE=0 WHERE ID=%s',tid));
        }else{
            var res=yield databaseUtils.executeQuery(util.format('UPDATE TANK_METADATA SET ACTIVE=1 WHERE ID=%s',tid));
        }
    }
    this.redirect('itank');
},
}
