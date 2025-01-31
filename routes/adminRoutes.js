const express = require('express');
const AdminCtl = require('../controller/adminCtl');
const Admin = require('../models/AdminModel');
const router = express.Router();
const passport = require('passport');

//user admin Routes
router.use('/',require('./uearRoutes'));

// nestedRoutes of category  ;
router.use('/category',passport.checkLoginAdmin,require('./categoryRoutes'));

// nestedRoutes of blog 
router.use('/blog',passport.checkLoginAdmin,require('./blogRoutes'));

// login system ------------

router.get('/login',AdminCtl.login);

router.post('/checkLogin',passport.authenticate('admin_strategy',{failureRedirect:'/login'}),AdminCtl.checkLogin);

router.get('/logOut',AdminCtl.logOut);

//---------------------

// profile show ---------------

router.get('/myProfile',passport.checkLoginAdmin,AdminCtl.myProfile);

// ----------------------

// change password --------------------

router.get('/checkPassword',passport.checkLoginAdmin,AdminCtl.checkPassword);

router.post('/verifyNewPassword',AdminCtl.verifyNewPassword);

//-----------------------

// forget password ==-----------------------------

router.get('/checkEmail',AdminCtl.checkEmail);

router.post('/verifyEmail',AdminCtl.verifyEmail);

router.get('/checkOtp',AdminCtl.checkOtp);

router.post('/verifyOtp',AdminCtl.verifyOtp);

router.get('/forgetPassword',AdminCtl.forgetPassword);

router.post('/setNewPassword',AdminCtl.setNewPassword);

//--------------------------

router.get('/dashBoard',passport.checkLoginAdmin,AdminCtl.dashBoard);

router.get('/addAdmin',passport.checkLoginAdmin,AdminCtl.addAdmin);

router.post('/insertAdmin',Admin.uploadAdminImage,AdminCtl.insertAdmin);

router.get('/viewAdmin',passport.checkLoginAdmin,AdminCtl.viewAdmin);

router.get('/deleteAdmin/:id',AdminCtl.deleteAdmin);

router.get('/updateAdmin/:id',passport.checkLoginAdmin,AdminCtl.updateAdmin);

router.post('/editAdmin',Admin.uploadAdminImage,AdminCtl.editAdmin);

router.post('/deleteAllAdmin',AdminCtl.deleteAllAdmin);

module.exports = router;