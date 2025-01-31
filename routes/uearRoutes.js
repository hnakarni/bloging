const express = require('express');

const router = express.Router();
const UserPanelCtl = require('../controller/userPanelCtl');
const User= require('../models/userModel');
const passport = require('passport');

router.get('/',UserPanelCtl.home);

router.get('/singleNews/:id',UserPanelCtl.singleNews);

// comments 
router.post('/addComment',UserPanelCtl.addComment);

router.get('/deleteComment/:id',UserPanelCtl.deleteComment);
//---------------

// user login adn sign up 
router.get('/userSignUp',UserPanelCtl.userSignUp);

router.post('/createUser',User.uploadUserImage,UserPanelCtl.createUser);

router.get('/userLogin',UserPanelCtl.userLogin);

router.post('/checkUser',passport.authenticate('user_strategy',{failureRedirect:'/userLogin'}),UserPanelCtl.checkUser);

router.get('/logOutUser',UserPanelCtl.logOutUser);

router.get("/likesBlogComment/:commentId", UserPanelCtl.likesBlogComment);
router.get("/dislikesBlogComment/:commentId", UserPanelCtl.dislikesBlogComment);
//---------------------------

module.exports = router;