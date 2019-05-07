var sessionUtils = require('../utils/sessionUtils');
var util=require('util');
var databaseUtils=require('./../utils/databaseUtils');

module.exports = {
    
    showEmployeePage: function* (next) {
        var sessionId = this.cookies.get("SESSION_ID");
        var user=sessionUtils.getCurrentUser(sessionId,function(err,res){
            if(res) console.log(res);
            else console.log("no user");
        });


    },
    showEmployee1Page : function *(next){
        var queryString='SELECT FNAME,PIC FROM USER';
        var query=util.format(queryString);
        var res=yield databaseUtils.executeQuery(query);

        yield this.render('employee1',{
            res:res,
        });

    },
    showiemployeePage: function* (next) {
        var pid;
try{ pid=this.currentUser[0].PID;}
catch(e){pid=0;}


        var QueryString;
        var query;
        var employeeResult;
        var tt='All';
            var etype=this.request.query.etype;
            if (etype=='All'){
                queryString=' SELECT USER.ID AS ID,FNAME,LNAME,TYPE,ADDRESS,PHONE,EMAIL,ADHAAR,ACTIVE,PIC FROM USER,ROLE,USER_ROLE WHERE USER.ID=USER_ROLE.USER_ID AND ROLE.ID=USER_ROLE.ROLE_ID AND USER.PID=%s';
                query = util.format(queryString,pid);
                tt='All';
            }
            else{
                queryString='SELECT USER.ID AS ID,FNAME,LNAME,TYPE,ADDRESS,PHONE,EMAIL,ADHAAR,ACTIVE,PIC FROM USER,ROLE,USER_ROLE WHERE USER.ID=USER_ROLE.USER_ID AND ROLE.ID=USER_ROLE.ROLE_ID AND USER.PID=%s AND TYPE="%s"';
                query=util.format(queryString,pid,etype);
                tt=etype;
            }
            employeeResult=yield databaseUtils.executeQuery(query);
            if(employeeResult.length==0){
            QueryString='SELECT USER.ID AS ID,FNAME,LNAME,TYPE,ADDRESS,PHONE,EMAIL,ADHAAR,ACTIVE,PIC FROM USER,ROLE,USER_ROLE WHERE USER.ID=USER_ROLE.USER_ID AND ROLE.ID=USER_ROLE.ROLE_ID AND USER.PID=%s';
            query=util.format(QueryString,pid);
            employeeResult=yield databaseUtils.executeQuery(query);
            tt='All';
        }
    
        //employeeResult=yield databaseUtils.executeQuery(query);
        var QueryString='SELECT DISTINCT(TYPE),ID FROM ROLE WHERE PID=%s';
        var query=util.format(QueryString,pid);
        var employeerole=yield databaseUtils.executeQuery(query);
        yield this.render('iemployee',{
            employeeResult:employeeResult,
            employeeRole:employeerole,
            tt:tt,
    });
},
showiEmployee2Page: function* (next) {0
    var pid;
try{ pid=this.currentUser[0].PID;}
catch(e){pid=0;}

    var act;
    var tact=this.request.body.act;
    if(tact) act=tact.split(' ');
    else 
    act=this.request.body.fields.act.split(' ');
    var etype;
    var employeeResult;
    var employeeRole;
    if(act[0]=="2"){
        var FNAME=this.request.body.fields.FNAME;
        var LNAME=this.request.body.fields.LNAME;
        var TYPE=this.request.body.fields.TYPE;
        var ADDRESS=this.request.body.fields.ADDRESS;
        var EMAIL=this.request.body.fields.EMAIL;
        var PHONE=this.request.body.fields.PHONE;
        var ADHAAR=this.request.body.fields.ADHAAR;
        var filee=this.request.body.files;
        var pic=filee.pic.path.split('\\');
        var pwd=this.request.body.fields.pwd;

        console.log(FNAME,LNAME,ADDRESS,EMAIL,PHONE,ADHAAR,pwd,pic[pic.length-1],parseInt(act[1]));
        console.log(TYPE);

    queryString='UPDATE USER SET FNAME="%s",LNAME="%s",ADDRESS="%s",EMAIL="%s",PHONE=%s,ADHAAR=%s,PASSWORD="%s",PIC="%s" WHERE ID=%s';
    query=util.format(queryString,FNAME,LNAME,ADDRESS,EMAIL,PHONE,ADHAAR,pwd,pic[pic.length-1],parseInt(act[1]));
    var res=yield databaseUtils.executeQuery(query);
    
    var rid;
    res=yield databaseUtils.executeQuery(util.format('SELECT ID FROM ROLE WHERE PID=%s AND TYPE="%s"',pid,TYPE));
        if(res.length==0){
            var res=yield databaseUtils.executeQuery(util.format('INSERT INTO ROLE (TYPE,PID) VALUES("%s",%s)',TYPE,pid));
            rid=res.insertId;
        }
        else{
            rid=res[0].ID;
        }
        console.log(rid,parseInt(act[1]));
    queryString='UPDATE USER_ROLE SET ROLE_ID=%s WHERE USER_ID=%s';
    query=util.format(queryString,rid,parseInt(act[1]));
    res=yield databaseUtils.executeQuery(query);
    }
    else if(act[0]=="3"){

        var FNAME=this.request.body.fields.FNAME;
        var LNAME=this.request.body.fields.LNAME;
        var TYPE=this.request.body.fields.TYPE;
        var ADDRESS=this.request.body.fields.ADDRESS;
        var EMAIL=this.request.body.fields.EMAIL;
        var PHONE=this.request.body.fields.PHONE;
        var ADHAAR=this.request.body.fields.ADHAAR;
        var filee=this.request.body.files;
        var pic=filee.pic.path.split('\\');
        var pwd=this.request.body.fields.pwd;

        queryString='INSERT INTO USER (PID,FNAME,LNAME,ADDRESS,EMAIL,PHONE,ADHAAR,PASSWORD,PIC) \
        VALUES(%s,"%s","%s","%s","%s",%s,%s,"%s","%s")';
        query=util.format(queryString,pid,FNAME,LNAME,ADDRESS,EMAIL,PHONE,ADHAAR,pwd,pic[pic.length-1]);
        var res=yield databaseUtils.executeQuery(query);
        var uid=res.insertId;

        res=yield databaseUtils.executeQuery(util.format('SELECT ID FROM ROLE WHERE PID=%s AND TYPE="%s"',pid,TYPE));
        if(res.length==0){
            var res=yield databaseUtils.executeQuery(util.format('INSERT INTO ROLE (TYPE,PID) VALUES("%s",%s)',TYPE,pid));
            rid=res.insertId;
        }
        else{
            rid=res[0].ID;
        }
        console.log(pid,uid,rid);
        var r=yield databaseUtils.executeQuery(util.format('INSERT INTO USER_ROLE (PID,USER_ID,ROLE_ID)\
        VALUES(%s,%s,%s)',pid,uid,rid));
    }
    

    else{
        console.log(act);
        var eid=parseInt(act[2]);
        if(parseInt(act[1])==0){
        var res=yield databaseUtils.executeQuery(util.format('UPDATE USER SET ACTIVE=0 WHERE ID=%s',eid));
        }else{
            var res=yield databaseUtils.executeQuery(util.format('UPDATE USER SET ACTIVE=1 WHERE ID=%s',eid));
        }
    }



    this.redirect('iemployee');
    /*
    yield this.render('iemployee',{
        employeeResult:employeeResult,
        employeeRole:employeeRole,
        tt:tt,
});*/
}
    
    
}
