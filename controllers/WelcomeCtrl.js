var sessionUtils = require('../utils/sessionUtils');

var util=require('util');
var databaseUtils=require('./../utils/databaseUtils');
var redisUtils = require('../utils/redisUtils');

module.exports = {
    showDashboardPage: function* (next) {
        var pid;
try{ pid=this.currentUser[0].PID;}
catch(e){pid=0;}
        //var pid=1;
        //Keeping this query just for sample query
        /*
        var queryString='select * from user where id = %s';
        var query=util.format(queryString,userid);
        var result=yield databaseUtils.executeQuery(query);
        var userDetails=result[0];
        */

        var petrolpumpQueryString='select * from petrolpump where id=%s';
        var petrolpumpQuery=util.format(petrolpumpQueryString,pid);
        var petrolpumpResult=yield databaseUtils.executeQuery(petrolpumpQuery);

        //For total sale of HSD and MS
        var saleQueryString='SELECT N.TYPE,SUM(DOR-DCR-PUMP_TEST-SELF) AS SALE FROM SHIFT S,SHIFT_NOZZLE_DSM SND,NOZZLE N WHERE SND.NOZZLE_ID=N.ID AND SND.SHIFT_ID=S.ID AND DATE(S.START_TIME)=CURDATE() AND S.PID=%s GROUP BY N.TYPE';
        var saleQuery=util.format(saleQueryString,pid);
        var saleResult=yield databaseUtils.executeQuery(saleQuery);

        //For toal quantity left of HSD and MS
        var quantityQueryString='SELECT N.TYPE,SUM(DCR) AS QTY_LEFT FROM SHIFT S,SHIFT_NOZZLE_DSM SND,NOZZLE N WHERE SND.NOZZLE_ID=N.ID AND SND.SHIFT_ID=S.ID AND DATE(S.START_TIME)=CURDATE() AND S.PID=%s GROUP BY S.ID,N.TYPE LIMIT 2;';
        var quantityQuery=util.format(quantityQueryString,pid);
        var quantityResult=yield databaseUtils.executeQuery(quantityQuery);

        //For total onhand cash
        var cashQueryString='SELECT TOTAL FROM CASH WHERE PID=%s ORDER BY ID DESC LIMIT 1';
        var cashQuery=util.format(cashQueryString,pid);
        var cashResult=yield databaseUtils.executeQuery(cashQuery);

        //For total bank balance
        var bankQueryString='SELECT SUM(BALANCE) AS TOTAL FROM BANK_ACCOUNT WHERE PID=%s AND ACTIVE=1';
        var bankQuery=util.format(bankQueryString,pid);
        var bankResult=yield databaseUtils.executeQuery(bankQuery);

        //For total fleet balance
        var fleetQueryString='SELECT BALANCE AS TOTAL FROM FLEET WHERE PID=%s ORDER BY ID DESC LIMIT 1';
        var fleetQuery=util.format(fleetQueryString,pid);
        var fleetResult=yield databaseUtils.executeQuery(fleetQuery);


        var shiftQueryString='SELECT S.START_TIME,S.END_TIME,U1.FNAME AS SUPERVISOR FROM SHIFT S,USER U1 WHERE S.SUPERVISOR_ID=U1.ID AND S.PID=%s ORDER BY S.ID DESC LIMIT 1;';
        var shiftQuery=util.format(shiftQueryString,pid);
        var shiftResult=yield databaseUtils.executeQuery(shiftQuery);

        var nozzleCountQueryString='SELECT COUNT(*) as C FROM NOZZLE WHERE PID=%s';
        var nozzleCountQuery=util.format(nozzleCountQueryString,pid);
        var nozzleCountResult=yield databaseUtils.executeQuery(nozzleCountQuery);

        var shiftDetailsQueryString='SELECT U2.FNAME AS DSM,NOZZLE_NUMBER,DOR FROM SHIFT S,NOZZLE N,SHIFT_NOZZLE_DSM SND, USER U2 WHERE SND.NOZZLE_ID=N.ID AND U2.ID=SND.USER_ID AND S.ID=SND.SHIFT_ID AND S.PID=%s ORDER BY S.ID DESC LIMIT %s';
        var shiftDetailsQuery=util.format(shiftDetailsQueryString,pid,nozzleCountResult[0].C);
        var shiftDetailsResult=yield databaseUtils.executeQuery(shiftDetailsQuery);

        yield this.render('dashboard',{
            petrolpumpResult:petrolpumpResult[0],
            saleResult:saleResult,
            quantityResult:quantityResult,
            cashResult:cashResult[0],
            bankResult:bankResult[0],
            fleetResult:fleetResult[0],
            shiftResult:shiftResult[0],
            shiftDetailsResult:shiftDetailsResult
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

    addNewPetrolPump: function* (next) {
        var name=this.request.body.fields.Name;
        var address=this.request.body.fields.Address;
        var city=this.request.body.fields.City;
        var pincode=this.request.body.fields.Pincode;
        var registration=this.request.body.fields.Registration;
        var mail=this.request.body.fields.mail;
        var phone=this.request.body.fields.Phone;
        var state=this.request.body.fields.State;
        var queryString='INSERT INTO PETROLPUMP (NAME,ADDRESS,CITY,PINCODE,REGISTRATION,EMAIL,PHONE,STATE) \
        VALUES("%s","%s","%s",%s,"%s","%s",%s,"%s")';
        var query=util.format(queryString,name,address,city,pincode,registration,mail,phone,state);
        var errormsg;
        var pid;
        var rid;
        try{
        var res=yield databaseUtils.executeQuery(query);
        pid=res.insertId;
        var fname=this.request.body.fields.fname;
        var lname=this.request.body.fields.lname;
        address=this.request.body.fields.aaddress;
        phone=this.request.body.fields.aphone;
        mail=this.request.body.fields.aemail;
        var adhaar=this.request.body.fields.adhaar;
        var password=this.request.body.fields.password;
        var filee=this.request.body.files;
        var pic=filee.pic.path.split('\\');
        queryString='INSERT INTO USER (PID,FNAME,LNAME,ADDRESS,PHONE,EMAIL,ADHAAR,PASSWORD,PIC)\
        VALUES(%d,"%s","%s","%s",%s,"%s",%s,"%s","%s")';
        query=util.format(queryString,pid,fname,lname,address,phone,mail,adhaar,password,pic[pic.length-1]);
        res=yield databaseUtils.executeQuery(query);
        var uid=res.insertId;
        
            var res=yield databaseUtils.executeQuery(util.format('INSERT INTO ROLE (TYPE,PID) VALUES(\'ADMIN\',%s)',pid));
            rid=res.insertId;
        var r=yield databaseUtils.executeQuery(util.format('INSERT INTO USER_ROLE (PID,USER_ID,ROLE_ID)\
        VALUES(%s,%s,%s)',pid,uid,rid));
    }
    catch(e){
        if(pid){
        var r=yield databaseUtils.executeQuery(util.format('DELETE FROM ROLE WHERE PID=%s',pid));
        r=yield databaseUtils.executeQuery(util.format('DELETE FROM PETROLPUMP WHERE ID=%s',pid));
        }
        errormsg=e;
    }
        if(errormsg){
            yield this.render('addPetrolPump',{
                errormsg:errormsg,
        });
        }
        else{
            //this.redirect('/app/login');
            var msg='You have Successfully Create An Account...\nNow Login to proceed further...';
            yield this.render('login',{
                msg:msg,
            });
        }

    },


    showEmpEnteriesPage: function* (next) {
        // var pid=this.request.body.fields.pid;
        // var fname=this.request.body.fields.firstname;
        // var lname=this.request.body.fields.lastname;
        // var address=this.request.body.fields.address;
        // var phone=this.request.body.fields.phone;
        // var email=this.request.body.fields.email;

        // var adhar=this.request.body.fields.adhar;
        
        // var filee=this.request.body.files;
        // var tph=filee.pic.path.split('\\');
        
        // var queryString1='INSERT INTO USER (PID,FNAME,LNAME,ADDRESS,PHONE,EMAIL,ADHAAR,PIC) \
        // VALUES(%s,"%s","%s","%s",%s,"%s",%s,"%s")';
        // var query1=util.format(queryString1,pid,fname,lname,address,phone,email,adhar,tph[tph.length-1]);
        // var res1=yield databaseUtils.executeQuery(query1);
        var s=this.currentUser;
        console.log(s);
        console.log(s[0].PIC);

        yield this.render('msg',{
    });
    },

    showEmpEnteries1Page: function* (next) {
        yield this.render('empent',{

    });
},


   showNewPetrolPumpPage: function* (next) {
        yield this.render('addPetrolPump',{
            errormsg:false,
    });
},


showLoginPage: function* (next) {
    var msg;
    yield this.render('login',{
        msg:msg,
});
},
showmsgpage: function* (next) {

    yield this.render('msg',{

});
},
showidash: function*(next){

    yield this.render('idash',{
        
    });
},
showHeader: function*(next){
    yield this.render('newheader',{

    });
},
}
