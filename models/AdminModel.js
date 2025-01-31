const mongoose = require('mongoose');
const moment = require('moment');

const path = require('path');
const multer = require('multer');
const imagePath = '/uploads/admin';

const AdminSchema = mongoose.Schema({
    name:{
        type:String,
        required : true
    },
    email:{
        type:String,
        required : true
    },
    password:{
        type:String,
        required : true
    },
    gender:{
        type:String,
        required : true
    },
    hobby:{
        type:Array,
        required : true
    },
    city:{
        type:String,
        required : true
    },
    admin_image:{
        type:String,
        required : true
    },
    about:{
        type:String,
        required : true
    },
    date:{
        type:String,
        default:moment().format('YYYY-MM-DD')
    }
})

const imageStorage = multer.diskStorage({
    destination : (req,file,cb)=>{
        cb(null,path.join(__dirname,'..',imagePath));
    },
    filename : (req,file,cb)=>{
        cb(null,file.fieldname+'-'+Date.now());
    }
})

AdminSchema.statics.uploadAdminImage = multer({storage:imageStorage}).single('admin_image');
AdminSchema.statics.imgPath = imagePath;

const Admin = mongoose.model('Admin',AdminSchema);
module.exports = Admin;