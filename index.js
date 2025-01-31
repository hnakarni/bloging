const express = require('express');
const path = require('path');
const port =  8002;
const db = require('./config/db');
const cookieParser = require('cookie-parser');

const passport = require('passport');
const session = require('express-session');
const localStategy = require('./config/passport-local-stategy');

const flash = require('connect-flash');
const flashMassage = require('./config/flashMassage');

const app = express();

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname,"assets")));
app.use('/uploads',express.static(path.join(__dirname,"uploads")));


app.use(session({
    name:'admin',
    secret : "AdminSecretKey",
    saveUninitialized:false,
    resave:false,
    cookie:{
      maxAge:60*60*1000  
    } 
}));


app.use(passport.initialize());
app.use(passport.session());
app.use(passport.setAuthAdminData);

app.use(flash());
app.use(flashMassage.setFlash);


app.use('/',require('./routes/adminRoutes'));



app.listen(port,err=>console.log(err?err:"Server runing on http://localhost:"+port));