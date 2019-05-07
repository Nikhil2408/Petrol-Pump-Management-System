var sessionUtils = require('../utils/sessionUtils');
var util=require('util');
var databaseUtils=require('./../utils/databaseUtils');

module.exports = {
    
    showReportpage: function* (next) {
        var msg;
        var pid;
try{ pid=this.currentUser[0].PID;}
catch(e){pid=0;
    msg='Login FIrst';

}
if(msg) yield this.render('login',{
    msg:msg,
});
else{
        var queryString;
        var query;
        var msg;
        // QUERY FOR GETTING SHIFT DETAILS
        queryString='SELECT SHIFT_ID AS ID,SHIFT_TYPE,DATE(STARTTIME) AS DATE,U1.FNAME AS SUPERVISOR FROM SHIFT_NOZZLE_DSM SND,SHIFT S,USER U1,SHIFT_METADATA SM WHERE SHIFT_META_DATA_ID=SM.ID AND SUPERVISOR_ID=U1.ID AND SND.SHIFT_ID=S.ID AND DCR!=0 AND S.PID=%s ORDER BY SHIFT_ID DESC LIMIT 1';
        query = util.format(queryString,pid);
        var shiftDetailsResult=yield databaseUtils.executeQuery(query);

        if(shiftDetailsResult.length==0){
            msg='No Reports Found...!!!';
            yield this.render('report',{
                msg:msg,
            });
        }
        else{

        var sid;
        //Fetching Shift ID from Query Parameter for Particuler shift
        sid=this.request.query.sid;
        console.log('Query parameter se li sid hai...',sid);
        if(!sid){
        //Fetched Shift ID
        var sid=shiftDetailsResult[0].ID;
        }
        else{
            queryString='SELECT SHIFT_ID AS ID,SHIFT_TYPE,DATE(STARTTIME) AS DATE,U1.FNAME AS SUPERVISOR FROM SHIFT_NOZZLE_DSM SND,SHIFT S,USER U1,SHIFT_METADATA SM WHERE SHIFT_META_DATA_ID=SM.ID AND SUPERVISOR_ID=U1.ID AND SND.SHIFT_ID=S.ID AND S.PID=%s AND S.ID=%s';
            query = util.format(queryString,pid,sid);
            shiftDetailsResult=yield databaseUtils.executeQuery(query);
        }
        console.log(sid);

        // QUERY FOR ELECTRONIC TOTALIZER 
        queryString='SELECT N.NOZZLE_NUMBER AS NOZZLE, N.TYPE AS PRODUCT,U1.FNAME AS ASSIGNTED_TO,DOR,DCR,PUMP_TEST,(DCR-DOR-PUMP_TEST) AS SALE FROM SHIFT_NOZZLE_DSM SND,NOZZLE N,USER U1 WHERE SND.NOZZLE_ID=N.ID AND SND.USER_ID=U1.ID AND SND.SHIFT_ID=%s AND N.PID=%s';
        query=util.format(queryString,sid,pid);
        var elecTotalizerResult=yield databaseUtils.executeQuery(query);

        queryString='SELECT N.TYPE AS PRODUCT, SUM(DCR-DOR) AS DISP,SUM(PUMP_TEST) AS PUMPTEST,SUM(DCR-DOR-PUMP_TEST) AS SALE FROM SHIFT_NOZZLE_DSM SND,NOZZLE N,USER U1 WHERE SND.NOZZLE_ID=N.ID AND SND.USER_ID=U1.ID AND SND.SHIFT_ID=%s AND N.PID=%s GROUP BY N.TYPE ORDER BY N.TYPE';
        query=util.format(queryString,sid,pid);
        var elecTotalizerResult1=yield databaseUtils.executeQuery(query);

        // QUERY FOR MANUAL TOTALIZER 
        queryString='SELECT N.NOZZLE_NUMBER AS NOZZLE, N.TYPE AS PRODUCT,U1.FNAME AS ASSIGNTED_TO,AOR,ACR,PUMP_TEST,(ACR-AOR-PUMP_TEST) AS SALE FROM SHIFT_NOZZLE_DSM SND,NOZZLE N,USER U1 WHERE SND.NOZZLE_ID=N.ID AND SND.USER_ID=U1.ID AND SND.SHIFT_ID=%s AND N.PID=%s';
        query=util.format(queryString,sid,pid);
        var manTotalizerResult=yield databaseUtils.executeQuery(query);

        queryString='SELECT N.TYPE AS PRODUCT, SUM(ACR-AOR) AS DISP,SUM(PUMP_TEST) AS PUMPTEST,SUM(ACR-AOR-PUMP_TEST) AS SALE FROM SHIFT_NOZZLE_DSM SND,NOZZLE N,USER U1 WHERE SND.NOZZLE_ID=N.ID AND SND.USER_ID=U1.ID AND SND.SHIFT_ID=%s AND N.PID=%s GROUP BY N.TYPE';
        query=util.format(queryString,sid,pid);
        var manTotalizerResult1=yield databaseUtils.executeQuery(query);

        // QUERY FOR DIFF  BETWEEN ELEC. AND MANUAL TOTALIZER 
        queryString='SELECT N.TYPE AS PRODUCT,SUM(PUMP_TEST) AS PUMPTEST,(SUM(AOR-ACR-PUMP_TEST)-SUM(DOR-DCR-PUMP_TEST)) AS DIFFERENCE FROM SHIFT_NOZZLE_DSM SND,NOZZLE N,USER U1 WHERE SND.NOZZLE_ID=N.ID AND SND.USER_ID=U1.ID AND SND.SHIFT_ID=%s AND N.PID=%s GROUP BY N.TYPE ORDER BY N.TYPE';
        query=util.format(queryString,sid,pid);
        var emdiffResult=yield databaseUtils.executeQuery(query);
        
        // // QUERY FOR GETTING VOLUME THROUGH HEIGHT
        // queryString='SELECT SP.SID, P.NAME,SP.QTY AS QTY,CMV+MMV*(SP.QTY-CAST(SP.QTY AS SIGNED))*10 AS VOLUME FROM SHIFT_PRICE SP,PRODUCT P,DATASHEET D,TANK_METADATA TM WHERE P.ID=SP.PRO_ID AND D.PID=%s AND D.TANK_METADATA_ID=TM.ID AND TM.TYPE=P.NAME AND HEIGHT=CAST(SP.QTY AS UNSIGNED)\
        //  AND (SP.SID=(SELECT SHIFT_ID AS SID FROM SHIFT_NOZZLE_DSM SND,SHIFT S,USER U1,SHIFT_METADATA SM WHERE SHIFT_META_DATA_ID=SM.ID AND SUPERVISOR_ID=U1.ID AND SND.SHIFT_ID=S.ID AND DCR!=0 AND ACR!=0 AND S.PID=%s GROUP BY SHIFT_ID ORDER BY SHIFT_ID DESC LIMIT 1 OFFSET 1) OR SP.SID=%s) \
        //  ORDER BY P.NAME,SP.SID';
        //  console.log(pid,sid);
        // query=util.format(queryString,pid,pid,sid);
        // //console.log(tankheightQuery);
        // var tankheightResult=yield databaseUtils.executeQuery(query);
        queryString='SELECT SP.SID,TM.TYPE, CLOSE_READING,(CMV+MMV*(CLOSE_READING-CAST(CLOSE_READING AS SIGNED))*10) AS CLOSE FROM TANK T LEFT JOIN TANK_METADATA TM ON T.TANK_ID=TM.ID LEFT JOIN PRODUCT P ON TM.TYPE=P.NAME LEFT JOIN SHIFT_PRICE SP ON P.ID=SP.PRO_ID LEFT JOIN DATASHEET D ON T.TANK_ID=D.TANK_METADATA_ID WHERE TM.PID=%s AND D.HEIGHT=CAST(CLOSE_READING AS SIGNED) AND SP.SID=%s AND T.SHIFT_ID=%s ORDER BY TM.TYPE';
        query=util.format(queryString,pid,sid,sid);
        var tankheightResult1=yield databaseUtils.executeQuery(query);

        queryString='SELECT SP.SID,TM.TYPE, OPEN_READING,(CMV+MMV*(OPEN_READING-CAST(OPEN_READING AS SIGNED))*10) AS OPEN FROM TANK T LEFT JOIN TANK_METADATA TM ON T.TANK_ID=TM.ID LEFT JOIN PRODUCT P ON TM.TYPE=P.NAME LEFT JOIN SHIFT_PRICE SP ON P.ID=SP.PRO_ID LEFT JOIN DATASHEET D ON T.TANK_ID=D.TANK_METADATA_ID WHERE TM.PID=%s AND D.HEIGHT=CAST(OPEN_READING AS SIGNED) AND SP.SID=%s AND T.SHIFT_ID=%s ORDER BY TM.TYPE';
        query=util.format(queryString,pid,sid,sid);
        var tankheightResult2=yield databaseUtils.executeQuery(query);

        console.log(tankheightResult1.length,tankheightResult2.length);
        // QUERY FOR PRODUCT PRICE 
        queryString='SELECT DISTINCT(NAME) AS NAME,PRICE FROM PRODUCT P,NOZZLE N WHERE N.TYPE=P.NAME AND P.PID=%s ORDER BY NAME';
        query=util.format(queryString,pid);
        var priceResult=yield databaseUtils.executeQuery(query);

        // SS CHECKSHEET QUERY FOR ESTIMATING COLLECTION 
        queryString='SELECT NOZZLE_NUMBER,U.FNAME AS ASSIGNED_TO,N.TYPE, (DCR-DOR-PUMP_TEST-SELF) AS SALE,(DCR-DOR-PUMP_TEST-SELF)*PRICE AS COLLECTION FROM SHIFT S, SHIFT_NOZZLE_DSM SND,NOZZLE N,PRODUCT P,USER U WHERE S.ID=SND.SHIFT_ID AND SND.USER_ID=U.ID AND N.ID=SND.NOZZLE_ID AND N.TYPE=P.NAME AND S.ID=%s AND P.PID=%s ORDER BY NOZZLE_NUMBER';
        query=util.format(queryString,sid,pid);
        var estResult=yield databaseUtils.executeQuery(query);

        // CHECKSHEET QUERY FOR ACTUAL COLLECTION (TO SHOW) 
        queryString='SELECT NOZZLE_NUMBER,U.FNAME,CM.MODE,SC.AMOUNT FROM SHIFT S,SHIFT_NOZZLE_DSM SND,NOZZLE N,SHIFT_COLLECTION SC,COLLECTION_MODE CM,USER U WHERE S.ID=SND.SHIFT_ID AND SND.NOZZLE_ID=N.ID AND SND.ID=SC.SHIFT_NOZZLE_DSM_ID AND SC.COLLECTION_MODE_ID=CM.ID AND U.ID=SND.USER_ID AND S.PID=%s AND S.ID=%s ORDER BY NOZZLE_NUMBER';
        query=util.format(queryString,pid,sid);
        var actResult=yield databaseUtils.executeQuery(query);

        // CHECKSHEET QUERY FOR ACTUAL COLLECTION (TO CALCULATE) 
        queryString='SELECT NOZZLE_NUMBER,U.FNAME AS ASSIGNED_TO ,SUM(SC.AMOUNT) AS COLLECTION FROM SHIFT S,SHIFT_NOZZLE_DSM SND,NOZZLE N,SHIFT_COLLECTION SC,COLLECTION_MODE CM,USER U WHERE S.ID=SND.SHIFT_ID AND SND.NOZZLE_ID=N.ID AND SND.ID=SC.SHIFT_NOZZLE_DSM_ID AND SC.COLLECTION_MODE_ID=CM.ID AND U.ID=SND.USER_ID AND S.PID=%s AND S.ID=%s GROUP BY NOZZLE_NUMBER ORDER BY NOZZLE_NUMBER;';
        query=util.format(queryString,pid,sid);
        var actResult1=yield databaseUtils.executeQuery(query);

        var msg;

        yield this.render('report',{
            shiftDetailsResult:shiftDetailsResult[0],
            elecTotalizerResult:elecTotalizerResult,
            elecTotalizerResult1:elecTotalizerResult1,
            manTotalizerResult:manTotalizerResult,
            manTotalizerResult1:manTotalizerResult1,
            emdiffResult:emdiffResult,
        //    tankheightResult:tankheightResult,
            priceResult:priceResult,
            estResult:estResult,
            actResult:actResult,
            actResult1:actResult1,
            msg:msg,
            tankheightResult1:tankheightResult1,
            tankheightResult2:tankheightResult2,
        });
    }
    }
    }

}
