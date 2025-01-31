const mongoose = require('mongoose');

const imagePath = '/uploads/blog';
const multer = require('multer');
const path = require('path');

const BlogSchema = mongoose.Schema({
    categoryId:{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Category",
        required:true
    },
    title:{
        type : String,
        required : true
    },
    blog_image:{
        type: String,
        required:true
    },
    description:{
        type : String,
        required : true
    },
    status:{
        type:Boolean,
        default:true
    },
    commentIds:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Comment'
    }]
    
},{timestamps:true})


const imageStorage = multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null,path.join(__dirname,'..',imagePath));
    },
    filename:(req,file,cb)=>{
        cb(null,file.fieldname+'-'+Date.now());
    }
})

BlogSchema.statics.uploadImage = multer({storage:imageStorage}).single('blog_image');
BlogSchema.statics.imgPath = imagePath;

const Blog = mongoose.model('Blog',BlogSchema);

module.exports = Blog;