var Router= require('koa-router');
var bodyParser = require('koa-body')();

module.exports = function(app){

    var router = new Router();

   // Welcome Routes

     var welcomeCtrl = require('./../controllers/WelcomeCtrl');
     var shiftCtrl = require('./../controllers/shiftCtrl');
     var reportCtrl = require('./../controllers/reportCtrl');
     //var detailCtrl = require('./../controllers/detailCtrl');
     var financeCtrl = require('./../controllers/financeCtrl');
     var employeeCtrl = require('./../controllers/employeeCtrl');
    var userCtrl = require('./../controllers/userCtrl');
    var tankCtrl = require('./../controllers/tankCtrl');
    var productCtrl = require('./../controllers/productCtrl');
    var nozzleCtrl = require('./../controllers/nozzleCtrl');
    var collectionCtrl = require('./../controllers/collectionCtrl');
    var fuelReceiptCtrl= require('./../controllers/fuelReceiptCtrl');
    var transportCtrl= require('./../controllers/transportCtrl');
    var creditCtrl = require('./../controllers/icreditCtrl');

    router.get('/icredit',creditCtrl.showiCreditPage);
    router.post('/icredit',creditCtrl.showiCredit2Page);
    
    router.get('/transport',transportCtrl.showTransport);
    router.post('/transport',transportCtrl.showTransport2);

    router.get('/fuelReceipt',fuelReceiptCtrl.showfuelReceipt);

     router.get('/dashboard/:pid', welcomeCtrl.showDashboardPage);

     router.get('/newPetrolPump', welcomeCtrl.showNewPetrolPumpPage);

     router.post('/newPetrolPump', welcomeCtrl.addNewPetrolPump);

     router.get('/shift/:pid', shiftCtrl.showShiftpage);
     router.get('/report', reportCtrl.showReportpage);
     //router.get('/tank/:pid', detailCtrl.showtankPage);
     router.get('/employee', employeeCtrl.showEmployeePage);
     //router.get('/product/:pid', detailCtrl.showProductPage);
    router.get('/empent',welcomeCtrl.showEmpEnteries1Page);
    router.get('/msg',welcomeCtrl.showEmpEnteriesPage);
    
     router.get('/finance/:pid', financeCtrl.showfinancePage);
     router.get('/itank', tankCtrl.showiTankPage);
     router.post('/itank', tankCtrl.showiTank3Page);
     router.get('/iproduct', productCtrl.showiProductPage);
     router.post('/iproduct',productCtrl.showiProduct2Page);
     router.get('/login', welcomeCtrl.showLoginPage);
     router.post('/getpage',userCtrl.login);
    router.get('/logout',userCtrl.logout);
    router.get('/employee1',employeeCtrl.showEmployee1Page);
    router.get('/ishift',shiftCtrl.showiShiftPage);
    
    router.post('/ishift',shiftCtrl.showiShift2Page);
    router.get('/iemployee',employeeCtrl.showiemployeePage);
    router.get('/ifinance',financeCtrl.showifinancePage);
    router.post('/iemployee',employeeCtrl.showiEmployee2Page);
    router.get('/ischedule',shiftCtrl.showiSchedulePage);
    router.post('/ischedule',shiftCtrl.showiSchedule2Page);

    router.get('/idash',welcomeCtrl.showidash);
    router.get('/header',welcomeCtrl.showHeader);

    router.get('/inozzle',nozzleCtrl.showiNozzlePage);
    router.post('/inozzle',nozzleCtrl.showiNozzle2Page);

    router.get('/icollectionmode',collectionCtrl.showicollectionPage);
    router.post('/icollectionmode',collectionCtrl.showicollection2Page);


    return router.middleware();
}
