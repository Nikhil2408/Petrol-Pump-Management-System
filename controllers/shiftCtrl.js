var sessionUtils = require('../utils/sessionUtils');
var util=require('util');
var databaseUtils=require('./../utils/databaseUtils');

module.exports = {


    showShiftpage: function* (next) {
        var pid;
try{ pid=this.currentUser[0].PID;}
catch(e){pid=0;}

        var queryString;
        var query;
        

        //Show all available shifts
        queryString='SELECT SHIFT_TYPE,TIME(STARTTIME) AS START,TIME(ENDTIME) AS END FROM SHIFT_METADATA WHERE PID=%s';
        query=util.format(queryString,pid);
        var availableShiftResult=yield databaseUtils.executeQuery(query);

        //Show all Available Supervisors
        queryString='SELECT FNAME,LNAME FROM USER U,ROLE R,USER_ROLE UR WHERE U.ID=UR.USER_ID AND R.ID=UR.ROLE_ID AND U.PID=%s AND R.TYPE=\'SUPERVISOR\' AND U.ACTIVE=1';
        query=util.format(queryString,pid);
        var availableSupervisorResult=yield databaseUtils.executeQuery(query);

        
        //Show all available nozzles
        queryString='SELECT NOZZLE_NUMBER FROM NOZZLE WHERE PID=1 AND ACTIVE=1';
        query=util.format(queryString,pid);
        var availableNozzleResult=yield databaseUtils.executeQuery(query);

        //Show all available DSM(s)
        queryString='SELECT FNAME,LNAME FROM USER U,ROLE R,USER_ROLE UR WHERE U.ID=UR.USER_ID AND R.ID=UR.ROLE_ID AND U.PID=%s AND R.TYPE=\'DSM\' AND U.ACTIVE=1';
        query=util.format(queryString,pid);
        var availableDSMResult=yield databaseUtils.executeQuery(query);

        //To end shift
        queryString='SELECT NOZZLE_NUMBER,N.TYPE,U1.FNAME AS SUPERVISOR,U2.FNAME AS DSM, START_TIME,END_TIME,DOR  FROM SHIFT_NOZZLE_DSM SND,USER U1,USER U2,SHIFT S,NOZZLE N WHERE N.ID=SND.NOZZLE_ID AND SND.SHIFT_ID=S.ID AND U1.ID=S.SUPERVISOR_ID AND U2.ID=SND.USER_ID AND DCR=0 AND S.PID=%s';
        query=util.format(queryString,pid);
        var endShiftResult=yield databaseUtils.executeQuery(query);

        //To View Shift
        queryString='SELECT S.ID AS ID,SM.SHIFT_TYPE, U1.FNAME AS SUPERVISOR, S.START_TIME,S.END_TIME FROM SHIFT_METADATA SM,SHIFT S,USER U1,SHIFT_NOZZLE_DSM SND WHERE SM.ID=S.SHIFT_META_DATA_ID AND S.SUPERVISOR_ID=U1.ID AND S.ID=SND.SHIFT_ID AND DCR!=0 AND S.PID=%s GROUP BY S.ID';
        query=util.format(queryString,pid);
        var viewShiftResult=yield databaseUtils.executeQuery(query);


        yield this.render('shift',{
            availableShiftResult:availableShiftResult,
            availableSupervisorResult:availableSupervisorResult,
            availableNozzleResult:availableNozzleResult,
            availableDSMResult:availableDSMResult,
            endShiftResult:endShiftResult,
            viewShiftResult:viewShiftResult
        });
    },
    
    logout: function* (next) {
        var sessionId = this.cookies.get("SESSION_ID");
        if(sessionId) {
            sessionUtils.deleteSession(sessionId);
        }
        this.cookies.set("SESSION_ID", '', {expires: new Date(1), path: '/'});

        this.redirect('/');
    },
    showiShiftPage: function* (next){

        var pid;
try{ pid=this.currentUser[0].PID;}
catch(e){pid=0;}


        queryString='SELECT * FROM SHIFT_METADATA SM WHERE NOT EXISTS(SELECT ID FROM SHIFT S WHERE S.SHIFT_META_DATA_ID=SM.ID AND DATE(START_TIME)=CURDATE()) AND PID=%s';
        query=util.format(queryString,pid);
        var availableShiftResult=yield databaseUtils.executeQuery(query);

        //Show all Available Supervisors/DSM
        queryString='SELECT U.ID,FNAME,LNAME,R.TYPE AS TYPE FROM USER U,ROLE R,USER_ROLE UR WHERE U.ID=UR.USER_ID AND R.ID=UR.ROLE_ID AND U.PID=%s AND (R.TYPE=\'SUPERVISOR\' OR R.TYPE=\'DSM\') AND U.ACTIVE=1';
        query=util.format(queryString,pid);
        var availableSupervisorResult=yield databaseUtils.executeQuery(query);

        //Show all available nozzles
        queryString='SELECT N.ID as ID,NOZZLE_NUMBER,DCR AS DOR,ACR AS AOR FROM NOZZLE N,SHIFT_NOZZLE_DSM SND WHERE N.ID=SND.NOZZLE_ID AND PID=%s AND ACTIVE=1 AND SND.SHIFT_ID=(SELECT MAX(ID) FROM SHIFT WHERE PID=%s)';
        query=util.format(queryString,pid,pid);
        var availableNozzleResult=yield databaseUtils.executeQuery(query);

        if(availableNozzleResult.length==0){
            queryString='SELECT ID,NOZZLE_NUMBER,0 AS DOR,0 AS AOR FROM NOZZLE WHERE PID=%s';
            query=util.format(queryString,pid);
            availableNozzleResult=yield databaseUtils.executeQuery(query);
        }

        //Query to show all available tanks(for opening reading)
        queryString='SELECT TYPE,CLOSE_READING FROM TANK,TANK_METADATA WHERE TANK.TANK_ID=TANK_METADATA.ID AND SHIFT_ID=(SELECT MAX(SHIFT_ID) FROM TANK T,SHIFT S WHERE T.SHIFT_ID=S.ID AND S.PID=%s) ORDER BY TYPE';
        query=util.format(queryString,pid);
        var tanksResult=yield databaseUtils.executeQuery(query);

        if(tanksResult.length==0){
            tanksResult=yield databaseUtils.executeQuery(util.format('SELECT NAME AS TYPE,QTY AS CLOSE_READING FROM PRODUCT P,TANK_METADATA TM WHERE P.NAME=TM.TYPE AND P.PID=%s',pid));
        }

        //Query to get the first shift that should be ended
        queryString='SELECT FNAME,LNAME,SHIFT_ID,NOZZLE_ID,USER_ID,DOR,DCR,AOR,ACR,PUMP_TEST,SELF FROM SHIFT_NOZZLE_DSM SND,USER U WHERE SND.SHIFT_ID=(SELECT SHIFT_ID FROM SHIFT_NOZZLE_DSM WHERE DCR=0 AND ACR=0 AND PID=%s ORDER BY ID LIMIT 1) AND U.ID=SND.USER_ID';
        query=util.format(queryString,pid);
        var endShiftResult=yield databaseUtils.executeQuery(query);
        
        //Query to get all payment modes
        queryString='SELECT MODE FROM COLLECTION_MODE WHERE PID=%s ORDER BY MODE';
        query=util.format(queryString,pid);
        var paymentModes=yield databaseUtils.executeQuery(query);


        //var tanksResult1=yield databaseUtils.executeQuery(util.format('SELECT NAME AS TYPE,QTY AS OPEN_READING FROM PRODUCT P,TANK_METADATA TM WHERE P.NAME=TM.TYPE AND P.PID=%s',pid));
        var tanksResult1=yield databaseUtils.executeQuery(util.format('SELECT TYPE,OPEN_READING FROM TANK,TANK_METADATA WHERE TANK.TANK_ID=TANK_METADATA.ID AND SHIFT_ID=(SELECT MAX(SHIFT_ID) FROM TANK T,SHIFT S WHERE T.SHIFT_ID=S.ID AND S.PID=%s) ORDER BY TYPE',pid));

        //For FIlter Purpose
        var dateactive=this.request.query.dateactive;
        var countactive=this.request.query.countactive;
        var from;
        var to;
        var count;
        var viewShiftResult
        if(dateactive && countactive){
            from=this.request.query.from;
            to=this.request.query.to;
            count=this.request.query.count;
            queryString='SELECT S.ID AS ID,START_TIME,END_TIME,FNAME,LNAME FROM SHIFT S,USER U WHERE U.ID=S.SUPERVISOR_ID AND S.PID=%s AND S.START_TIME>="%s" AND S.START_TIME<="%s" LIMIT %s';
            query=util.format(queryString,pid,from,to,count);
            viewShiftResult=yield databaseUtils.executeQuery(query);
        }
        else if(dateactive){
            from=this.request.query.from;
            to=this.request.query.to;
            queryString='SELECT S.ID AS ID,START_TIME,END_TIME,FNAME,LNAME FROM SHIFT S,USER U WHERE U.ID=S.SUPERVISOR_ID AND S.PID=%s AND S.START_TIME>="%s" AND S.START_TIME<="%s"';
            query=util.format(queryString,pid,from,to);
            viewShiftResult=yield databaseUtils.executeQuery(query);
        }
        else if(countactive){
            count=this.request.query.count;
            queryString='SELECT S.ID AS ID,START_TIME,END_TIME,FNAME,LNAME FROM SHIFT S,USER U WHERE U.ID=S.SUPERVISOR_ID AND S.PID=%s LIMIT %s';
            query=util.format(queryString,pid,count);
            viewShiftResult=yield databaseUtils.executeQuery(query);
        }
        else{
            queryString='SELECT S.ID AS ID,START_TIME,END_TIME,FNAME,LNAME FROM SHIFT S,USER U WHERE U.ID=S.SUPERVISOR_ID AND S.PID=%s';
            query=util.format(queryString,pid);
            viewShiftResult=yield databaseUtils.executeQuery(query);
        }
        
        var transports=yield databaseUtils.executeQuery(util.format('SELECT * FROM TRANSPORT WHERE PID=%s',pid));

        var fuels=yield databaseUtils.executeQuery(util.format('SELECT * FROM TANK_METADATA WHERE PID=%s',pid));

        yield this.render('ishift',{
            availableShiftResult:availableShiftResult,
            availableSupervisorResult:availableSupervisorResult,
            availableNozzleResult:availableNozzleResult,
            endShiftResult:endShiftResult,
            paymentModes:paymentModes,
            viewShiftResult:viewShiftResult,
            tanksResult:tanksResult,
            countactive:countactive,
            dateactive:dateactive,
            from:from,
            to:to,
            count:count,
            transports:transports,
            fuels:fuels,
            tanksResult1:tanksResult1,
        });
    },
    showiShift2Page: function* (next){
        var pid;
try{ pid=this.currentUser[0].PID;}
catch(e){pid=0;}


        var stype=this.request.body.stype;
        var supervisor_id=this.request.body.supervisor;
        var act=this.request.body.act.split(" ");
        var queryString;
        var query;
        if(act[0]=="1"){
        var uid;
        var aor;
        var dor;
        queryString='INSERT INTO SHIFT (SUPERVISOR_ID,START_TIME,END_TIME,SHIFT_META_DATA_ID,PID)\
        SELECT %s,CONCAT(CURDATE()," ",TIME(STARTTIME)),CONCAT(CURDATE()," ",TIME(ENDTIME)),ID,%s\
        FROM SHIFT_METADATA WHERE ID=%s';
        query=util.format(queryString,supervisor_id,pid,stype);

        var res=yield databaseUtils.executeQuery(query);
        var sid=res.insertId;
        console.log(res);
        
        queryString='SELECT ID FROM NOZZLE WHERE PID=%s';
        query=util.format(queryString,pid);
        var nid=yield databaseUtils.executeQuery(query);
        for(var i=0;i<parseInt(act[1]);++i){
            uid=this.request.body['user'+i];
            aor=this.request.body['aor'+i];
            dor=this.request.body['dor'+i];
            console.log(uid);
            console.log(aor);
            console.log(dor);
            
            queryString='INSERT INTO SHIFT_NOZZLE_DSM (SHIFT_ID,NOZZLE_ID,USER_ID,AOR,DOR,ACR,DCR,PUMP_TEST,SELF)\
            VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s)';
            query=util.format(queryString,sid,nid[i].ID,uid,aor,dor,0,0,0,0);

            var r=yield databaseUtils.executeQuery(query);
        }
        var or;
        tankid=yield databaseUtils.executeQuery(util.format('SELECT ID FROM TANK_METADATA WHERE PID=%s ORDER BY TYPE',pid));
        for(var i=0;i<parseInt(act[2]);++i){
            or=this.request.body['cr'+i];
            queryString='INSERT INTO TANK (TANK_ID,SHIFT_ID,OPEN_READING,CLOSE_READING,FUEL_RECEIVED)\
            VALUES(%s,%s,%s,%s,%s)';
            console.log(tankid[i].ID,sid,or,0,0);
            query=util.format(queryString,tankid[i].ID,sid,or,0,0);
            var re=yield databaseUtils.executeQuery(query);
        }
        var res=yield databaseUtils.executeQuery(util.format('INSERT INTO SHIFT_PRICE (PID,PRO_ID,PRICE,QTY,SID) SELECT "%s",ID,PRICE,QTY,"%s" FROM PRODUCT WHERE PID="%s"',pid,sid,pid));
        }
        else if(act[0]=="2"){
        var sid=parseInt(act[2]);
        var acr;
        var dcr;
        var pt;
        var self;
        queryString='SELECT ID FROM NOZZLE WHERE PID=%s ORDER BY NOZZLE_NUMBER';
        query=util.format(queryString,pid);
        var nid=yield databaseUtils.executeQuery(query);

        queryString='SELECT ID FROM COLLECTION_MODE WHERE PID=%s ORDER BY MODE';
        query=util.format(queryString,pid);
        var cmid=yield databaseUtils.executeQuery(query);
        
        queryString='SELECT ID FROM SHIFT_NOZZLE_DSM WHERE SHIFT_ID=%s';
        query=util.format(queryString,sid);
        var sndid=yield databaseUtils.executeQuery(query);
        
        var tankid=yield databaseUtils.executeQuery(util.format('SELECT ID FROM TANK_METADATA WHERE PID=%s ORDER BY TYPE',pid));
        queryString='UPDATE SHIFT_NOZZLE_DSM SET ACR=%s,DCR=%s,PUMP_TEST=%s,SELF=%s WHERE SHIFT_ID=%s AND NOZZLE_ID=%s';
        for(var i=0;i<nid.length;++i){
            acr=this.request.body['acr'+i];
            dcr=this.request.body['dcr'+i];
            pt=this.request.body['pt'+i];
            self=this.request.body['self'+i];
            query=util.format(queryString,acr,dcr,pt,self,sid,nid[i].ID);
            var r=yield databaseUtils.executeQuery(query);
        }
        queryString='INSERT INTO SHIFT_COLLECTION (SHIFT_NOZZLE_DSM_ID,COLLECTION_MODE_ID,AMOUNT,PID) VALUES(%d,%d,%d,%d)';
        for(var i=0;i<nid.length;++i){
            for(var j=0;j<cmid.length;++j){
                var amt=this.request.body['amt'+i+' '+j];
                query=util.format(queryString,sndid[i].ID,cmid[j].ID,amt,pid);
                var r=yield databaseUtils.executeQuery(query);
            }
        }
        var cr;
        for(var i=0;i<tankid.length;++i){
            cr=this.request.body['cr'+i];
            queryString='UPDATE TANK SET CLOSE_READING=%s WHERE TANK_ID=%s AND SHIFT_ID=%s';
            console.log(cr,tankid[i].ID,sid);
            query=util.format(queryString,cr,tankid[i].ID,sid);
            var re=yield databaseUtils.executeQuery(query);
        }
        var fr=this.request.body.fuelreceived;
        if(fr){
            var ttno=this.request.body.ttno;
            var transport=this.request.body.transport;
            var product=this.request.body.product;
            var invoiceno=this.request.body.invoiceno;
            var invoicedate=this.request.body.invoicedate;
            var invoiceamount=this.request.body.invoiceamount;
            var invoiceqty=this.request.body.invoiceqty;
            var invoicetemp=this.request.body.invoicetemp;
            var rotemp=this.request.body.rotemp;
            var invoicedensity=this.request.body.invoicedensity;
            var rodensity=this.request.body.rodensity;
            var tva=this.request.body.tva;
            var shorttransport=this.request.body.short;
            var fino=this.request.body.finvoiceno;
            var fia=this.request.body.finvoiceamount;

            queryString='INSERT INTO FUEL_RECEIPT (PID,TT,TID,PRO_ID,INVOICE_NO,INVOICE_DATE,INVOICE_AMOUNT,INVOICE_QTY,INVOICE_TEMP,RO_TEMP,INVOICE_DENSITY,RO_COMPOSITE_DENSITY,TVA,SHORT_REPORT,FREIGHT_INVOICE_NO,FREIGHT_INVOICE_AMOUNT) \
            VALUES(%s,%s,%s,%s,%s,"%s",%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)';
            query=util.format(queryString,pid,ttno,transport,product,invoiceno,invoicedate,invoiceamount,invoiceqty,invoicetemp,rotemp,invoicedensity,rodensity,tva,shorttransport,fino,fia);
            res=yield databaseUtils.executeQuery(query);
            
        }
        var toupdate=yield databaseUtils.executeQuery(util.format('SELECT CM.ID,SUM(AMOUNT) as CRDB FROM SHIFT S,SHIFT_NOZZLE_DSM SND,COLLECTION_MODE CM,SHIFT_COLLECTION SC WHERE S.ID=SND.SHIFT_ID AND SND.ID=SC.SHIFT_NOZZLE_DSM_ID AND SC.COLLECTION_MODE_ID=CM.ID AND S.PID=%s AND S.ID=%s GROUP BY CM.MODE',pid,sid));
        var oldbal=yield databaseUtils.executeQuery(util.format('SELECT B.MODE,BAL FROM COLLECTION_MODE CM,BALANCE B WHERE CM.PID=%s AND B.SID=(SELECT MAX(SID) FROM BALANCE WHERE PID=%s) AND CM.ID=B.MODE ORDER BY B.MODE ',pid,pid));
        var len;
        if(toupdate.length>oldbal.length) len=toupdate.length;
        else len=oldbal.length;
        for(var i=0;i<len;++i){
            if(toupdate.ID==oldbal.MODE){
                res=yield databaseUtils.executeQuery(util.format('INSERT INTO BALANCE (CRDB,BAL,PID,MODE,SID)\
                VALUES(%s,%s,%s,%s,%s)',toupdate[i].CRDB,toupdate[i].CRDB+oldbal[i].BAL,pid,oldbal[i].MODE,sid));
            }
        }
    }
        this.redirect('/app/ishift');

    },






    showiSchedulePage: function* (next) {
        var pid;
try{ pid=this.currentUser[0].PID;}
catch(e){pid=0;}


        var QueryString;
        var query;
        QueryString='SELECT SHIFT_METADATA.ID,STARTTIME,ENDTIME,SHIFT_TYPE,SID,FNAME,LNAME,SHIFT_METADATA.ACTIVE  FROM SHIFT_METADATA,USER WHERE USER.ID=SHIFT_METADATA.SID  AND USER.PID=%s';
        query=util.format(QueryString,pid);
        var ScheduleResult=yield databaseUtils.executeQuery(query);
        //queryString='SELECT DISTINCT(FNAME),U1.ID AS ID FROM USER U1,SHIFT_METADATA SM WHERE U1.ID=SM.SID AND SM.PID=%s';
        queryString='SELECT U.ID AS ID,FNAME FROM USER U,ROLE R,USER_ROLE UR WHERE U.ID=UR.USER_ID AND R.ID=UR.ROLE_ID AND R.TYPE=\'SUPERVISOR\' AND U.PID=%s';
        query=util.format(queryString,pid);
        var availableSupervisorResult=yield databaseUtils.executeQuery(query);
        //var QueryString='SELECT DISTINCT(SHIFT_TYPE) FROM SHIFT_METADATA WHERE PID=%s';
        //var query=util.format(QueryString,pid);
        //var ShiftType=yield databaseUtils.executeQuery(query);
        yield this.render('ischedule',{
            ScheduleResult:ScheduleResult,
            availableSupervisorResult:availableSupervisorResult,
          //  ShiftType:ShiftType,
    });
},
showiSchedule2Page: function* (next) {
    var pid;
try{ pid=this.currentUser[0].PID;}
catch(e){pid=0;}


    var scid=this.request.body.scid;
    var sid=this.request.body.sid;
    var starttime=this.request.body.starttime;
    var endtime=this.request.body.endtime;
    var act=this.request.body.scid.split(' ');
    if(parseInt(act[0])==1){
        //try{
       // pid=this.request.body.pid;
       // var starttime=this.request.body.starttime;
       // var endtime=this.request.body.endtime;
        var shifttype =this.request.body.shifttype;
        //var sid =this.request.body.sid;
        var queryString='INSERT INTO SHIFT_METADATA (PID,STARTTIME,ENDTIME,SHIFT_TYPE,SID) \
        VALUES(%s,CONCAT(CURDATE(),"%s"),CONCAT(CURDATE(),"%s"),%s,%s)';
        console.log(pid,starttime,endtime,shifttype,sid);
        var query=util.format(queryString,pid,' '+starttime,' '+endtime,shifttype,sid);
        var res=yield databaseUtils.executeQuery(query);
        //}
        // catch(e){
        //     pid=1;
        // }
    }
    else if(parseInt(act[0]==2)){
       // var pid=this.currentUser[0].PID;
       scid=parseInt(act[1]);
    var queryString='UPDATE SHIFT_METADATA SET STARTTIME=CONCAT(CURDATE(),"%s"),ENDTIME=CONCAT(CURDATE(),"%s"), SID=%s WHERE ID=%s';
    var query=util.format(queryString,' '+starttime,' '+endtime,sid,scid);
    var res=yield databaseUtils.executeQuery(query);
    }
    else{
        console.log(act);
        if(parseInt(act[1])==0){
            var res=yield databaseUtils.executeQuery(util.format('UPDATE SHIFT_METADATA SET ACTIVE=0 WHERE ID=%s',parseInt(act[2])));
        }
        else{
            var res=yield databaseUtils.executeQuery(util.format('UPDATE SHIFT_METADATA SET ACTIVE=1 WHERE ID=%s',parseInt(act[2])));
        }
    }

   
    var ScheduleQueryString;
    var ScheduleQuery;
    // var wf;
    try{
        //var wf=this.request.body.stype;
        
            ScheduleQueryString='SELECT SHIFT_METADATA.ID,STARTTIME,ENDTIME,SHIFT_TYPE,SID,FNAME,LNAME  FROM SHIFT_METADATA,USER WHERE USER.ID=SHIFT_METADATA.SID  AND USER.PID=%s';
            ScheduleQuery=util.format(ScheduleQueryString,pid);
        }
    
    catch(ee){
    }
    
    
    var ScheduleResult=yield databaseUtils.executeQuery(ScheduleQuery);
    
    

    /*var tankTypeQueryString='SELECT DISTINCT(TYPE) FROM TANK_METADATA WHERE PID=%s';
    var tankTypeQuery=util.format(tankTypeQueryString,pid);
    var tankType=yield databaseUtils.executeQuery(tankTypeQuery);
*/
queryString='SELECT DISTINCT(FNAME),U1.ID AS ID FROM USER U1,SHIFT_METADATA SM WHERE U1.ID=SM.SID AND SM.PID=%s';
query=util.format(queryString,pid);
var availableSupervisorResult=yield databaseUtils.executeQuery(query);
this.redirect('ischedule');
/*
    yield this.render('ischedule',{
        ScheduleResult:ScheduleResult,
        availableSupervisorResult:availableSupervisorResult,
});*/
}
}
