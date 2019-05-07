var sessionUtils = require('../utils/sessionUtils');
var util=require('util');
var databaseUtils=require('./../utils/databaseUtils');


module.exports = {
showiCreditPage: function*(next){

    var pid;
    try{ pid=this.currentUser[0].PID;}
    catch(e){pid=0;}

    var QueryString='SELECT ID,NAME,ADDRESS,PHONE,BALANCE FROM CREDIT WHERE PID=%s';
    var Query=util.format(QueryString,pid);
    var creditDetail=yield databaseUtils.executeQuery(Query);

    yield this.render('icredit',{
        creditDetail:creditDetail
        
    });
},

showiCredit2Page: function*(next){

    var pid;
    try{ pid=this.currentUser[0].PID;}
    catch(e){pid=0;}
    
    var cid;
    var act=this.request.body.cid.split(' ');
   // var tact=this.request.body.cid;
   // if(tact) cid=tact.split(' ');
   console.log(act);
    if(parseInt(act[0])==2)
    {
    var name=this.request.body.name;
    var address=this.request.body.address;
    var phone=this.request.body.phone;
    var balance=this.request.body.balance;
    console.log(name,address,phone,balance,parseInt(act[1]));
    if(name && address && phone && balance)
     {
      var queryString='UPDATE CREDIT SET NAME="%s",ADDRESS="%s",PHONE=%s ,BALANCE=%s WHERE ID=%s';
      var query=util.format(queryString,name,address,phone,balance,parseInt(act[1]));
      var res=yield databaseUtils.executeQuery(query);
     }
    }

else if(parseInt(act[0]==2))
  {
    
    
    var name=this.request.body.name;
    var address=this.request.body.address;
    var phone=this.request.body.phone;
    var balance=this.request.body.balance;

    var queryString='INSERT INTO CREDIT (PID,NAME,ADDRESS,PHONE,BALANCE) \
    VALUES(%s,"%s","%s",%s,%s)';
    var query=util.format(queryString,pid,name,address,phone,balance);
    var res=yield databaseUtils.executeQuery(query);
   
    }
    else{
        if(parseInt(act[1])==0){
            var res = yield databaseUtils.executeQuery(util.format('UPDATE CREDIT SET ACTIVE=0 WHERE ID=%s',parseInt(act[2])));
        }
        else{
            var res = yield databaseUtils.executeQuery(util.format('UPDATE CREDIT SET ACTIVE=1 WHERE ID=%s',parseInt(act[2])));
        }
    }
   
    this.redirect('icredit');
},

}