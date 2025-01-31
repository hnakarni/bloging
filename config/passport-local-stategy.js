const passport = require('passport');
const LocalStategy = require('passport-local').Strategy;
const Admin = require('../models/AdminModel');
const User = require('../models/userModel');

passport.use('admin_strategy',new LocalStategy({usernameField:'email'}, async function(email,password,done){
    console.log("middelware");
    console.log(email,password);
    const AdminData = await Admin.findOne({email:email});
    if(AdminData){
        if(AdminData.password==password){
            return done(null,{...AdminData,role:'admin'});
        }else{
            return done(null,false);
        }
    }else{
        return done(null,false);
    }
}));

passport.use('user_strategy',new LocalStategy({usernameField:'email'}, async function(email,password,done){
    console.log("middelware");
    console.log(email,password);
    const userData = await User.findOne({email:email});
    if(userData){
        if(userData.password==password){
            return done(null,{...userData,role:'user'});
        }else{
            return done(null,false);
        }
    }else{
        return done(null,false);
    }
}));



passport.serializeUser(function(user,done){
    return done(null,{id:user._doc._id,role:user.role});
})

passport.deserializeUser(async function(data,done){

    if(data.role=='admin'){
        const adminData= await Admin.findById(data.id); 
        if(adminData){
            return done(null,{...adminData,role:data.role});
        }else{
            return done(null,false);
        }
    }else if(data.role=='user'){
        const userData = await User.findById(data.id);
        if(userData){
            return done(null,{...userData,role:data.role});
        }else{
            return done(null,false);
        }
    }else{
        return done(null,false);
    }
});


passport.setAuthAdminData =async (req,res,next)=>{
    if(req.isAuthenticated()&&req.user.role == 'admin'){
        res.locals.adminData = req.user;
    }else if(req.isAuthenticated()&&req.user.role == 'user'){
        res.locals.userData = req.user;
    }
    next();
}

passport.checkLoginAdmin = (req,res,next)=>{
    if(req.isAuthenticated()){
        next();
    }else{
        return res.redirect('/login');
    }
}

module.exports = passport;