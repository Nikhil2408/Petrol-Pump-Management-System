var sessionUtils = require('../utils/sessionUtils');
var util=require('util');
var databaseUtils=require('./../utils/databaseUtils');

module.exports = {
    
    showfinancePage: function* (next) {

        var pid;
try{ pid=this.currentUser[0].PID;}
catch(e){pid=0;}
        var nozzle_number=this.request.query.no;
        if (nozzle_number==undefined) {
            nozzle_number=1;
        }

        var queryString;
        var query;
        
        //querry to show all details about all shifts
        queryString='SELECT U1.FNAME AS SUPERVISOR,U2.FNAME AS ASSIGNED_TO,TYPE,NOZZLE_NUMBER,SHIFT.START_TIME,SND.USER_ID,(DOR-DCR-PUMP_TEST-SELF) AS SALE,SC.ID,MODE,AMOUNT FROM SHIFT,SHIFT_NOZZLE_DSM SND,USER U1,NOZZLE,SHIFT_COLLECTION SC,COLLECTION_MODE CM, USER U2 WHERE SHIFT.ID=SND.SHIFT_ID AND U1.ID=SHIFT.SUPERVISOR_ID AND SND.NOZZLE_ID=NOZZLE.ID AND SND.ID=SC.SHIFT_NOZZLE_DSM_ID AND SND.USER_ID=U2.ID AND CM.ID=SC.COLLECTION_MODE_ID AND SHIFT.PID=%s AND SHIFT.END_TIME>=\'2018-01-01 00:00:00\' AND SHIFT.END_TIME<=\'2018-06-25 18:00:00\'';
        query=util.format(queryString,pid);
        var AllDetailfinanceResult=yield databaseUtils.executeQuery(query);
        var shiftDetails=AllDetailfinanceResult;


       //query to show sales according to ALL nozzle number
       queryString='SELECT USER.FNAME AS FNAME,TYPE,NOZZLE_NUMBER,SHIFT.START_TIME AS START_TIME,SHIFT_NOZZLE_DSM.USER_ID AS USER_ID,(DOR-DCR-PUMP_TEST-SELF) AS SALE,SHIFT_COLLECTION.ID AS ID,MODE,AMOUNT FROM SHIFT,SHIFT_NOZZLE_DSM,USER,NOZZLE,SHIFT_COLLECTION,COLLECTION_MODE WHERE SHIFT.ID=SHIFT_NOZZLE_DSM.SHIFT_ID AND USER.ID=SHIFT.SUPERVISOR_ID AND SHIFT_NOZZLE_DSM.NOZZLE_ID=NOZZLE.ID AND SHIFT_NOZZLE_DSM.ID=SHIFT_COLLECTION.SHIFT_NOZZLE_DSM_ID AND COLLECTION_MODE.ID=SHIFT_COLLECTION.COLLECTION_MODE_ID AND SHIFT.PID=%s AND SHIFT.START_TIME>=\'2018-01-01 00:00:00\' AND SHIFT.START_TIME<=\'2018-08-08 18:00:00\' GROUP BY NOZZLE_NUMBER,MODE';
       query=util.format(queryString,pid);
       var SalesNozzleResult=yield databaseUtils.executeQuery(query);
       var saleDetails=SalesNozzleResult;

       
       //QUERY TO SHOW SALES ACCORDING TO PARTICULAR NOZZLE NUMBER
        
       queryString='SELECT USER.FNAME AS FNAME,TYPE,NOZZLE_NUMBER,SHIFT.START_TIME AS START_TIME,SHIFT_NOZZLE_DSM.USER_ID AS USER_ID,(DOR-DCR-PUMP_TEST-SELF) AS SALE,SHIFT_COLLECTION.ID AS ID,MODE,AMOUNT FROM SHIFT,SHIFT_NOZZLE_DSM,USER,NOZZLE,SHIFT_COLLECTION,COLLECTION_MODE WHERE SHIFT.ID=SHIFT_NOZZLE_DSM.SHIFT_ID AND USER.ID=SHIFT.SUPERVISOR_ID AND SHIFT_NOZZLE_DSM.NOZZLE_ID=NOZZLE.ID AND SHIFT_NOZZLE_DSM.ID=SHIFT_COLLECTION.SHIFT_NOZZLE_DSM_ID AND COLLECTION_MODE.ID=SHIFT_COLLECTION.COLLECTION_MODE_ID AND SHIFT.PID=%s AND NOZZLE_NUMBER=%s AND SHIFT.START_TIME>=\'2018-01-01 00:00:00\' AND SHIFT.START_TIME<=\'2018-08-08 18:00:00\'';
       query=util.format(queryString,pid,nozzle_number);
       var SalesNozzleResult1=yield databaseUtils.executeQuery(query);
       var saleDetails1=SalesNozzleResult1;
       
       //show details of a specific supervisor

       
       queryString='SELECT USER.FNAME AS FNAME,TYPE,NOZZLE_NUMBER,SHIFT.START_TIME AS START_TIME,SHIFT_NOZZLE_DSM.USER_ID AS USER_ID,(DOR-DCR-PUMP_TEST-SELF) AS SALE,SHIFT_COLLECTION.ID AS ID,MODE,AMOUNT FROM SHIFT,SHIFT_NOZZLE_DSM,USER,NOZZLE,SHIFT_COLLECTION,COLLECTION_MODE WHERE SHIFT.ID=SHIFT_NOZZLE_DSM.SHIFT_ID AND USER.ID=SHIFT.SUPERVISOR_ID AND SHIFT_NOZZLE_DSM.NOZZLE_ID=NOZZLE.ID AND SHIFT_NOZZLE_DSM.ID=SHIFT_COLLECTION.SHIFT_NOZZLE_DSM_ID AND COLLECTION_MODE.ID=SHIFT_COLLECTION.COLLECTION_MODE_ID AND SHIFT.PID=%s AND SHIFT.START_TIME>=\'2018-01-01 00:00:00\' AND SHIFT.START_TIME<=\'2018-08-08 18:00:00\' AND USER.FNAME=\'AMAN\' group by nozzle_number,mode';
       query=util.format(queryString,pid);
       var SalesSupervisorResult=yield databaseUtils.executeQuery(query);
       var supervisorDetails=SalesSupervisorResult;
       // SHOW DETAILS OF ALL SUPERVISOR

       queryString='SELECT USER.FNAME AS FNAME,TYPE,NOZZLE_NUMBER,SHIFT.START_TIME AS START_TIME,SHIFT_NOZZLE_DSM.USER_ID AS USER_ID,(DOR-DCR-PUMP_TEST-SELF) AS SALE,SHIFT_COLLECTION.ID AS ID,MODE,AMOUNT FROM SHIFT,SHIFT_NOZZLE_DSM,USER,NOZZLE,SHIFT_COLLECTION,COLLECTION_MODE WHERE SHIFT.ID=SHIFT_NOZZLE_DSM.SHIFT_ID AND USER.ID=SHIFT.SUPERVISOR_ID AND SHIFT_NOZZLE_DSM.NOZZLE_ID=NOZZLE.ID AND SHIFT_NOZZLE_DSM.ID=SHIFT_COLLECTION.SHIFT_NOZZLE_DSM_ID AND COLLECTION_MODE.ID=SHIFT_COLLECTION.COLLECTION_MODE_ID AND SHIFT.PID=%s AND SHIFT.START_TIME>=\'2018-01-01 00:00:00\' AND SHIFT.START_TIME<=\'2018-08-08 18:00:00\' group by user.fname, nozzle_number,mode';
       query=util.format(queryString,pid);
       var SalesSupervisorResult1=yield databaseUtils.executeQuery(query);
       var supervisorDetails1=SalesSupervisorResult1;

       //to show details according to particular dsm
        
       queryString='SELECT U1.FNAME AS SUPERVISOR,U2.FNAME AS DSM,TYPE,NOZZLE_NUMBER,SHIFT.START_TIME AS START_TIME,SHIFT_NOZZLE_DSM.USER_ID AS USER_ID,(DOR-DCR-PUMP_TEST-SELF) AS SALE,SHIFT_COLLECTION.ID AS ID,MODE,AMOUNT FROM USER U1,SHIFT,SHIFT_NOZZLE_DSM,USER U2,NOZZLE,SHIFT_COLLECTION,COLLECTION_MODE WHERE SHIFT.ID=SHIFT_NOZZLE_DSM.SHIFT_ID AND U1.ID=SHIFT.SUPERVISOR_ID AND SHIFT_NOZZLE_DSM.NOZZLE_ID=NOZZLE.ID AND SHIFT_NOZZLE_DSM.ID=SHIFT_COLLECTION.SHIFT_NOZZLE_DSM_ID AND COLLECTION_MODE.ID=SHIFT_COLLECTION.COLLECTION_MODE_ID AND SHIFT_NOZZLE_DSM.USER_ID=U2.ID AND SHIFT.PID=%s AND SHIFT.START_TIME>=\'2018-01-01 00:00:00\' AND SHIFT.START_TIME<=\'2018-08-08 18:00:00\' AND U2.FNAME=\'SITA\'';
       query=util.format(queryString,pid);
       var SalesDSMResult=yield databaseUtils.executeQuery(query);
        var dsmDetails=SalesDSMResult;
       // TO SHOW DETAILS OF ALL DSM


       queryString='SELECT U1.FNAME AS SUPERVISOR,U2.FNAME AS DSM,TYPE,NOZZLE_NUMBER,SHIFT.START_TIME AS START_TIME,SHIFT_NOZZLE_DSM.USER_ID AS USER_ID,(DOR-DCR-PUMP_TEST-SELF) AS SALE,SHIFT_COLLECTION.ID AS ID,MODE,AMOUNT FROM USER U1,SHIFT,SHIFT_NOZZLE_DSM,USER U2,NOZZLE,SHIFT_COLLECTION,COLLECTION_MODE WHERE SHIFT.ID=SHIFT_NOZZLE_DSM.SHIFT_ID AND U1.ID=SHIFT.SUPERVISOR_ID AND SHIFT_NOZZLE_DSM.NOZZLE_ID=NOZZLE.ID AND SHIFT_NOZZLE_DSM.ID=SHIFT_COLLECTION.SHIFT_NOZZLE_DSM_ID AND COLLECTION_MODE.ID=SHIFT_COLLECTION.COLLECTION_MODE_ID AND SHIFT_NOZZLE_DSM.USER_ID=U2.ID AND SHIFT.PID=%s AND SHIFT.START_TIME>=\'2018-01-01 00:00:00\' AND SHIFT.START_TIME<=\'2018-08-08 18:00:00\' GROUP BY NOZZLE_NUMBER,START_TIME,MODE';
       query=util.format(queryString,pid);
       var SalesDSMResult1=yield databaseUtils.executeQuery(query);
        var dsmDetails1=SalesDSMResult1;


        yield this.render('finance',{
        shiftDetails:shiftDetails,
        saleDetails:saleDetails,
       saleDetails1:saleDetails1,
        supervisorDetails:supervisorDetails,
      supervisorDetails1:supervisorDetails1,
       dsmDetails:dsmDetails,
       dsmDetails1:dsmDetails1,
    //   supdsmDetails:supdsmDetails 

        });
    },
    showifinancePage: function* (next) {

        var pid;
try{ pid=this.currentUser[0].PID;}
catch(e){pid=0;}

        var queryString;
        var query;
        var from;
        var to;
        var nozzle;
        var supervisor;
        var mode;
        var dsm;
        var type;
        var f1;
        var f2;
        var f3;
        var f4;
        var f5;
        try{from=this.request.query.from;}catch(e){}
        try{to=this.request.query.to;}catch(e){}
        try{f1=this.request.query.f1;}catch(e){}
        try{f2=this.request.query.f2;}catch(e){}
        try{f3=this.request.query.f3;}catch(e){}
        try{f4=this.request.query.f4;}catch(e){}
        try{f5=this.request.query.f5;}catch(e){}
        try{nozzle=this.request.query.nozzle;}catch(e){}
        try{supervisor=this.request.query.supervisor;}catch(e){}
        try{dsm=this.request.query.dsm;}catch(e){}
        try{mode=this.request.query.mode;}catch(e){}
        try{type=this.request.query.type;}catch(e){}

        console.log(f1,f2,f3,f4,f5,nozzle,supervisor,dsm,mode,type);

        /*
        
        //querry to show all details about all shifts
        queryString='SELECT U1.FNAME AS SUPERVISOR,U2.FNAME AS ASSIGNED_TO,TYPE,NOZZLE_NUMBER,SHIFT.START_TIME,SND.USER_ID,(DOR-DCR-PUMP_TEST-SELF) AS SALE,SC.ID,MODE,AMOUNT FROM SHIFT,SHIFT_NOZZLE_DSM SND,USER U1,NOZZLE,SHIFT_COLLECTION SC,COLLECTION_MODE CM, USER U2 WHERE SHIFT.ID=SND.SHIFT_ID AND U1.ID=SHIFT.SUPERVISOR_ID AND SND.NOZZLE_ID=NOZZLE.ID AND SND.ID=SC.SHIFT_NOZZLE_DSM_ID AND SND.USER_ID=U2.ID AND CM.ID=SC.COLLECTION_MODE_ID AND SHIFT.PID=%s AND SHIFT.END_TIME>=\'2018-01-01 00:00:00\' AND SHIFT.END_TIME<=\'2018-06-25 18:00:00\'';
        query=util.format(queryString,pid);
        var AllDetailfinanceResult=yield databaseUtils.executeQuery(query);
        var shiftDetails=AllDetailfinanceResult;


       //query to show sales according to ALL nozzle number
       queryString='SELECT USER.FNAME AS FNAME,TYPE,NOZZLE_NUMBER,SHIFT.START_TIME AS START_TIME,SHIFT_NOZZLE_DSM.USER_ID AS USER_ID,(DOR-DCR-PUMP_TEST-SELF) AS SALE,SHIFT_COLLECTION.ID AS ID,MODE,AMOUNT FROM SHIFT,SHIFT_NOZZLE_DSM,USER,NOZZLE,SHIFT_COLLECTION,COLLECTION_MODE WHERE SHIFT.ID=SHIFT_NOZZLE_DSM.SHIFT_ID AND USER.ID=SHIFT.SUPERVISOR_ID AND SHIFT_NOZZLE_DSM.NOZZLE_ID=NOZZLE.ID AND SHIFT_NOZZLE_DSM.ID=SHIFT_COLLECTION.SHIFT_NOZZLE_DSM_ID AND COLLECTION_MODE.ID=SHIFT_COLLECTION.COLLECTION_MODE_ID AND SHIFT.PID=%s AND SHIFT.START_TIME>=\'2018-01-01 00:00:00\' AND SHIFT.START_TIME<=\'2018-08-08 18:00:00\' GROUP BY NOZZLE_NUMBER,MODE';
       query=util.format(queryString,pid);
       var SalesNozzleResult=yield databaseUtils.executeQuery(query);
       var saleDetails=SalesNozzleResult;

       
       //QUERY TO SHOW SALES ACCORDING TO PARTICULAR NOZZLE NUMBER
        
       queryString='SELECT USER.FNAME AS FNAME,TYPE,NOZZLE_NUMBER,SHIFT.START_TIME AS START_TIME,SHIFT_NOZZLE_DSM.USER_ID AS USER_ID,(DOR-DCR-PUMP_TEST-SELF) AS SALE,SHIFT_COLLECTION.ID AS ID,MODE,AMOUNT FROM SHIFT,SHIFT_NOZZLE_DSM,USER,NOZZLE,SHIFT_COLLECTION,COLLECTION_MODE WHERE SHIFT.ID=SHIFT_NOZZLE_DSM.SHIFT_ID AND USER.ID=SHIFT.SUPERVISOR_ID AND SHIFT_NOZZLE_DSM.NOZZLE_ID=NOZZLE.ID AND SHIFT_NOZZLE_DSM.ID=SHIFT_COLLECTION.SHIFT_NOZZLE_DSM_ID AND COLLECTION_MODE.ID=SHIFT_COLLECTION.COLLECTION_MODE_ID AND SHIFT.PID=%s AND NOZZLE_NUMBER=%s AND SHIFT.START_TIME>=\'2018-01-01 00:00:00\' AND SHIFT.START_TIME<=\'2018-08-08 18:00:00\'';
       query=util.format(queryString,pid,nozzle_number);
       var SalesNozzleResult1=yield databaseUtils.executeQuery(query);
       var saleDetails1=SalesNozzleResult1;
       
       //show details of a specific supervisor

       
       queryString='SELECT USER.FNAME AS FNAME,TYPE,NOZZLE_NUMBER,SHIFT.START_TIME AS START_TIME,SHIFT_NOZZLE_DSM.USER_ID AS USER_ID,(DOR-DCR-PUMP_TEST-SELF) AS SALE,SHIFT_COLLECTION.ID AS ID,MODE,AMOUNT FROM SHIFT,SHIFT_NOZZLE_DSM,USER,NOZZLE,SHIFT_COLLECTION,COLLECTION_MODE WHERE SHIFT.ID=SHIFT_NOZZLE_DSM.SHIFT_ID AND USER.ID=SHIFT.SUPERVISOR_ID AND SHIFT_NOZZLE_DSM.NOZZLE_ID=NOZZLE.ID AND SHIFT_NOZZLE_DSM.ID=SHIFT_COLLECTION.SHIFT_NOZZLE_DSM_ID AND COLLECTION_MODE.ID=SHIFT_COLLECTION.COLLECTION_MODE_ID AND SHIFT.PID=%s AND SHIFT.START_TIME>=\'2018-01-01 00:00:00\' AND SHIFT.START_TIME<=\'2018-08-08 18:00:00\' AND USER.FNAME=\'AMAN\' group by nozzle_number,mode';
       query=util.format(queryString,pid);
       var SalesSupervisorResult=yield databaseUtils.executeQuery(query);
       var supervisorDetails=SalesSupervisorResult;
       // SHOW DETAILS OF ALL SUPERVISOR

       queryString='SELECT USER.FNAME AS FNAME,TYPE,NOZZLE_NUMBER,SHIFT.START_TIME AS START_TIME,SHIFT_NOZZLE_DSM.USER_ID AS USER_ID,(DOR-DCR-PUMP_TEST-SELF) AS SALE,SHIFT_COLLECTION.ID AS ID,MODE,AMOUNT FROM SHIFT,SHIFT_NOZZLE_DSM,USER,NOZZLE,SHIFT_COLLECTION,COLLECTION_MODE WHERE SHIFT.ID=SHIFT_NOZZLE_DSM.SHIFT_ID AND USER.ID=SHIFT.SUPERVISOR_ID AND SHIFT_NOZZLE_DSM.NOZZLE_ID=NOZZLE.ID AND SHIFT_NOZZLE_DSM.ID=SHIFT_COLLECTION.SHIFT_NOZZLE_DSM_ID AND COLLECTION_MODE.ID=SHIFT_COLLECTION.COLLECTION_MODE_ID AND SHIFT.PID=%s AND SHIFT.START_TIME>=\'2018-01-01 00:00:00\' AND SHIFT.START_TIME<=\'2018-08-08 18:00:00\' group by user.fname, nozzle_number,mode';
       query=util.format(queryString,pid);
       var SalesSupervisorResult1=yield databaseUtils.executeQuery(query);
       var supervisorDetails1=SalesSupervisorResult1;

       //to show details according to particular dsm
        
       queryString='SELECT U1.FNAME AS SUPERVISOR,U2.FNAME AS DSM,TYPE,NOZZLE_NUMBER,SHIFT.START_TIME AS START_TIME,SHIFT_NOZZLE_DSM.USER_ID AS USER_ID,(DOR-DCR-PUMP_TEST-SELF) AS SALE,SHIFT_COLLECTION.ID AS ID,MODE,AMOUNT FROM USER U1,SHIFT,SHIFT_NOZZLE_DSM,USER U2,NOZZLE,SHIFT_COLLECTION,COLLECTION_MODE WHERE SHIFT.ID=SHIFT_NOZZLE_DSM.SHIFT_ID AND U1.ID=SHIFT.SUPERVISOR_ID AND SHIFT_NOZZLE_DSM.NOZZLE_ID=NOZZLE.ID AND SHIFT_NOZZLE_DSM.ID=SHIFT_COLLECTION.SHIFT_NOZZLE_DSM_ID AND COLLECTION_MODE.ID=SHIFT_COLLECTION.COLLECTION_MODE_ID AND SHIFT_NOZZLE_DSM.USER_ID=U2.ID AND SHIFT.PID=%s AND SHIFT.START_TIME>=\'2018-01-01 00:00:00\' AND SHIFT.START_TIME<=\'2018-08-08 18:00:00\' AND U2.FNAME=\'SITA\'';
       query=util.format(queryString,pid);
       var SalesDSMResult=yield databaseUtils.executeQuery(query);
        var dsmDetails=SalesDSMResult;
       // TO SHOW DETAILS OF ALL DSM
        */
        if(from){
            queryString='SELECT U1.FNAME AS SUPERVISOR,U2.FNAME AS DSM,TYPE,NOZZLE_NUMBER,SHIFT.START_TIME AS START_TIME,SHIFT_NOZZLE_DSM.USER_ID AS USER_ID,(DOR-DCR-PUMP_TEST-SELF) AS SALE,SHIFT_COLLECTION.ID AS ID,MODE,AMOUNT FROM USER U1,SHIFT,SHIFT_NOZZLE_DSM,USER U2,NOZZLE,SHIFT_COLLECTION,COLLECTION_MODE WHERE SHIFT.ID=SHIFT_NOZZLE_DSM.SHIFT_ID AND U1.ID=SHIFT.SUPERVISOR_ID AND SHIFT_NOZZLE_DSM.NOZZLE_ID=NOZZLE.ID AND SHIFT_NOZZLE_DSM.ID=SHIFT_COLLECTION.SHIFT_NOZZLE_DSM_ID AND COLLECTION_MODE.ID=SHIFT_COLLECTION.COLLECTION_MODE_ID AND SHIFT_NOZZLE_DSM.USER_ID=U2.ID AND SHIFT.PID=%s AND SHIFT.START_TIME>="%s" AND SHIFT.START_TIME<="%s" GROUP BY NOZZLE_NUMBER,START_TIME,MODE';
       query=util.format(queryString,pid,from,to);
        }
        else{
            queryString='SELECT U1.FNAME AS SUPERVISOR,U2.FNAME AS DSM,TYPE,NOZZLE_NUMBER,SHIFT.START_TIME AS START_TIME,SHIFT_NOZZLE_DSM.USER_ID AS USER_ID,(DOR-DCR-PUMP_TEST-SELF) AS SALE,SHIFT_COLLECTION.ID AS ID,MODE,AMOUNT FROM USER U1,SHIFT,SHIFT_NOZZLE_DSM,USER U2,NOZZLE,SHIFT_COLLECTION,COLLECTION_MODE WHERE SHIFT.ID=SHIFT_NOZZLE_DSM.SHIFT_ID AND U1.ID=SHIFT.SUPERVISOR_ID AND SHIFT_NOZZLE_DSM.NOZZLE_ID=NOZZLE.ID AND SHIFT_NOZZLE_DSM.ID=SHIFT_COLLECTION.SHIFT_NOZZLE_DSM_ID AND COLLECTION_MODE.ID=SHIFT_COLLECTION.COLLECTION_MODE_ID AND SHIFT_NOZZLE_DSM.USER_ID=U2.ID AND SHIFT.PID=%s GROUP BY NOZZLE_NUMBER,START_TIME,MODE';
       query=util.format(queryString,pid);
        }
       
       var SalesDSMResult1=yield databaseUtils.executeQuery(query);
        var dsmDetails1=SalesDSMResult1;
        

        var queryString='SELECT ID,NOZZLE_NUMBER FROM NOZZLE WHERE PID=%s';
        var query=util.format(queryString,pid);
        var nozzleCountResult=yield databaseUtils.executeQuery(query);

        queryString='SELECT U.ID,FNAME,LNAME,R.TYPE AS TYPE FROM USER U,ROLE R,USER_ROLE UR WHERE U.ID=UR.USER_ID AND R.ID=UR.ROLE_ID AND U.PID=%s AND (R.TYPE=\'SUPERVISOR\' OR R.TYPE=\'DSM\') AND U.ACTIVE=1';
        query=util.format(queryString,pid);
        var availablePersonResult=yield databaseUtils.executeQuery(query);

        queryString='SELECT ID,MODE FROM COLLECTION_MODE WHERE PID=%s ORDER BY MODE';
        query=util.format(queryString,pid);
        var paymentModes=yield databaseUtils.executeQuery(query);

        var queryString='SELECT DISTINCT(TYPE) FROM TANK_METADATA WHERE PID=%s';
        var query=util.format(queryString,pid);
        var tankType=yield databaseUtils.executeQuery(query);

        yield this.render('ifinance',{
    //     shiftDetails:shiftDetails,
    //     saleDetails:saleDetails,
    //    saleDetails1:saleDetails1,
    //     supervisorDetails:supervisorDetails,
    //   supervisorDetails1:supervisorDetails1,
    //    dsmDetails:dsmDetails,
        dsmDetails1:dsmDetails1,
       nozzleCountResult:nozzleCountResult,
       availablePersonResult:availablePersonResult,
       paymentModes:paymentModes,
       tankType:tankType,
       from:from,
       to:to,
       f1:f1,
       f2:f2,
       f3:f3,
       f4:f4,
       f5:f5,
       nozzle:nozzle,
       supervisor:supervisor,
       dsm:dsm,
       mode:mode,
       type:type,
    //   supdsmDetails:supdsmDetails 

        });
    },
    logout: function* (next) {
        var sessionId = this.cookies.get("SESSION_ID");
        if(sessionId) {
            sessionUtils.deleteSession(sessionId);
        }
        this.cookies.set("SESSION_ID", '', {expires: new Date(1), path: '/'});

        this.redirect('/');
    }
}
