const mongoose = require('mongoose');
const moment = require('moment');

const imagePath = '/uploads/user';
const path = require('path');
const multer = require('multer');

const userSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    profile_image:{
        type:String,
        required:true
    },
    date:{
        type:String,
        default:moment().format()
    },
})

const imageStorage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,path.join(__dirname,'..',imagePath));
    },
    filename :(req,file,cb)=>{
        cb(null,file.fieldname+'-'+Date.now());
    }
})

userSchema.statics.uploadUserImage = multer({storage:imageStorage}).single('profile_image');
userSchema.statics.imgPath = imagePath;


const User = mongoose.model('User',userSchema);
module.exports = User;