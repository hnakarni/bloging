const mongoose = require('mongoose');

const CategorySchema= mongoose.Schema({
    categoryName:{
        type : String,
        required : true
    },
    status:{
        type : Boolean,
        default:true
    },
    blogIds:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Blog',
    }]
},{timestamps:true});


const Category = mongoose.model('Category',CategorySchema);

module.exports = Category;