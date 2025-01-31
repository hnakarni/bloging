const mongoose = require('mongoose');
const moment = require('moment');

const CommentSchema=  mongoose.Schema({
    blogId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Blog',
        required:true
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    comment:{
        type:String,
        required:true
    },
    status:{
        type:Boolean,
        default:true
    },
    date:{
        type:String,
        default:moment().format()
    },
    likes : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    }],
    dislikes : [{
        type : mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    replies : []
})


const Comment = mongoose.model('Comment',CommentSchema);
module.exports = Comment;