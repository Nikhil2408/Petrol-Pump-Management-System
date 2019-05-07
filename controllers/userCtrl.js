
var sessionUtils = require('../utils/sessionUtils');
var util=require('util');
var databaseUtils=require('./../utils/databaseUtils');
module.exports={
login:function* (next){

    var user=this.request.body.email;
    var pwd=this.request.body.psw;

    var queryString='SELECT U.PID,FNAME,LNAME,ADDRESS,PHONE,EMAIL,PASSWORD,PIC,TYPE FROM USER U,ROLE R,USER_ROLE UR WHERE U.ID=UR.USER_ID AND R.ID=UR.ROLE_ID AND EMAIL="%s" AND PASSWORD="%s"';
    var query=util.format(queryString,user,pwd);
    var user=yield databaseUtils.executeQuery(query);
    var msg;
    if(user.length!=0){
        sessionUtils.saveUserInSession(user,this.cookies);
        this.redirect('/app/idash');
    }
    else{
        this.redirect('/app/login');
    }
},

signup: function* (next){
    var name=this.request.body.name;
    var email=this.request.body.email;
    var pwd=this.request.body.password;

    var queryString='INSERT INTO USER (FNAME,EMAIL,PASSWORD) VALUES("%s","%s","%s")';
    var query=util.format(queryString,name,email,pwd);

    var errormsg;

    try{
        var result=yield databaseUtils.executeQuery(query);

        queryString='SELECT * FROM USER WHERE ID = %s';
        query = util.format(queryString,result.ID);
        result=yield databaseUtils.executeQuery(query);

        var insertedUser=result[0];
        sessionUtils.saveUserInSession(insertedUser,this.cookies);
    }
    catch(e){
        if(e.code === 'ER_DUP_ENTRY'){
            errormsg='user already exists';
        } else {
            errormsg='error';
        }
    }
    if(errormsg){
        yield this.render('msg',{
            msg:errormsg,
        });
    }
    else{
        redirectUrl="/app/msg";
        this.redirect(redirectUrl);
    }
},
logout: function* (next) {
    var sessionId = this.cookies.get("SESSION_ID");
    if(sessionId) {
        sessionUtils.deleteSession(sessionId);
    }
    this.cookies.set("SESSION_ID", '', {expires: new Date(1), path: '/'});

    this.redirect('/app/login');
}
}
