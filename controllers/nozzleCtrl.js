var sessionUtils = require('../utils/sessionUtils');
var util=require('util');
var databaseUtils=require('./../utils/databaseUtils');

module.exports = {
    showiNozzlePage: function* (next) {
        var pid;
        try{ pid=this.currentUser[0].PID;}
        catch(e){pid=0;}

        var ntype=this.request.query.ntype;
        console.log(pid,ntype);

        var queryString;
        var query;

        if(ntype && ntype!='All'){
            queryString='SELECT * FROM NOZZLE WHERE PID="%s" AND TYPE="%s"';
            query=util.format(queryString,pid,ntype);
        }
        else{
            queryString='SELECT * FROM NOZZLE WHERE PID="%s"';
            query=util.format(queryString,pid);
        }

            var nozzleDetails=yield databaseUtils.executeQuery(query);

            queryString='SELECT DISTINCT(TYPE) FROM NOZZLE WHERE PID=%s';
            query=util.format(queryString,pid);
            var nozzleType=yield databaseUtils.executeQuery(query);

            queryString='SELECT TYPE FROM TANK_METADATA WHERE PID=%s';
            query=util.format(queryString,pid);
            var tankTypes=yield databaseUtils.executeQuery(query);

            yield this.render('inozzle',{
                nozzleDetails:nozzleDetails,
                nozzleType:nozzleType,
                ntype:ntype,
                tankTypes:tankTypes,
        });
    },
    showiNozzle2Page: function* (next) {
        var pid;
try{ pid=this.currentUser[0].PID;}
catch(e){pid=0;}


        var queryString;
        var query;
        var nozzleDetails;
        
        var act=this.request.body.act.split(' ');
        var nno=this.request.body.nno;
        var ntype=this.request.body.ntype;
            if(parseInt(act[0])==1){
                    queryString='INSERT INTO NOZZLE (PID,NOZZLE_NUMBER,TYPE) \
                    VALUES(%s,%s,"%s")';
                    query=util.format(queryString,pid,nno,ntype);
                    var res=yield databaseUtils.executeQuery(query);
            }
            else if(parseInt(act[0])==2) {
                queryString='UPDATE NOZZLE SET TYPE="%s" WHERE ID=%s';
                console.log(ntype,parseInt(act[1]));
                query=util.format(queryString,ntype,parseInt(act[1]));
                
                var r=yield databaseUtils.executeQuery(query);

            }
            else{
                console.log('ye waala console',act);
                if(parseInt(act[1])==0){
                    var res=yield databaseUtils.executeQuery(util.format('UPDATE NOZZLE SET ACTIVE=0 WHERE ID=%s',parseInt(act[2])));
                }
                else{
                    var res=yield databaseUtils.executeQuery(util.format('UPDATE NOZZLE SET ACTIVE=1 WHERE ID=%s',parseInt(act[2])));
                }
            }

            this.redirect('inozzle');
},
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

}
