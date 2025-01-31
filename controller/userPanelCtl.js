const Category = require('../models/CategoryModel');
const allBlog = require('../models/BlogModel');
const Blog = require('../models/BlogModel');
const moment = require('moment');
const User = require('../models/userModel');
const Comment = require('../models/commentModel');

module.exports.home = async (req,res)=>{
    try {
        const reqPath =(req.url).substr(0,11);
        let searchValue = '';
        let page = 0,perPageBlog = 3;
        let sort,sortType = '';

        if(req.query.sort&&req.query.sortType){
            sort = parseInt(req.query.sort);
            sortType = req.query.sortType;
        }

        if(req.query.search){
            searchValue = req.query.search;
        }

        if(req.query.page){
            page = req.query.page;
        }

        const allCategory = await Category.find({status:true});

        let catId;
        if(req.query.catId){
            catId=req.query.catId;
        }

        const allBlog = await Blog.find({
            status:true,
            ...(catId&&{categoryId:catId}),
            title:{$regex:searchValue,$options:'i'},
        }).sort({...(sort&&{[sortType]:sort})}).skip(perPageBlog*page).limit(perPageBlog).populate('categoryId').exec();

        const totalBlog = await Blog.find({
            status:true,
            title:{$regex:searchValue,$options:'i'},
        }).countDocuments();

        allBlog.map((item)=>{
            let momentTime = moment(item.createdAt).fromNow();
            item.time  = momentTime;
        })

        const totalPage = Math.ceil(totalBlog/perPageBlog);

        return res.render('userPanel/home',{
            reqPath,
            allCategory,
            allBlog,
            searchValue,
            page : parseInt(page),
            totalPage,
            totalBlog,
            sortType,
            sort
        });
    } catch (err) {
        console.log(err);
        return res.redirect('back');
    }
}

module.exports.singleNews = async (req,res)=>{
    try {
        const reqPath =(req.url).substr(0,11);
        const allCategory = await Category.find({status:true});
        const singleNews = await Blog.findById({_id:req.params.id}).populate('categoryId').exec();
        const recentBlog = await Blog.find({status:true}).sort({_id:-1}).limit(5);
        const totalBlog = await Blog.find({status:true}).countDocuments();
        const allComments = await Comment.find({blogId:req.params.id}).populate('userId').exec();

        allComments.map((item)=>{
            item.time = moment(item.date).fromNow();
        })

        return res.render('userPanel/singleNews',{allCategory,singleNews,reqPath,recentBlog,totalBlog,allComments})
    } catch (err) {
        console.log(err);
        return res.redirect('back');
    }
}

module.exports.addComment = async(req,res)=>{
    try {
        if(!res.locals.userData){
            return res.redirect('/userLogin');
        }
        console.log(req.body);
        const addedComment = await Comment.create(req.body);
        if(addedComment){
            const singleBlog = await Blog.findById(addedComment.blogId);
            singleBlog.commentIds.push(addedComment._id);
            await Blog.findByIdAndUpdate(singleBlog._id,singleBlog);
            console.log("Comment Add Successfully");
            return res.redirect('back');
        }else{
            console.log("Faild to add comment");
            return res.redirect('back');
        }
    } catch (err) {
        console.log(err);
        return res.redirect('back');
    }
}

module.exports.deleteComment = async (req,res)=>{
    try {
        const deletedComment = await Comment.findByIdAndDelete(req.params.id);
        if(deletedComment){
            const singleBlog = await Blog.findById(deletedComment.blogId);
            singleBlog.commentIds.splice(singleBlog.commentIds.indexOf(deletedComment._id),1);
            await Blog.findByIdAndUpdate(singleBlog._id,singleBlog);
            console.log("comment Deleted..");
            return res.redirect('back');
        }else{
            console.log("Faild to delete comment");
            return res.redirect('back');
        }
    } catch (err) {
        console.log(err);
        return res.redirect('back');
    }
}


// user login and  sign up 
module.exports.userSignUp = async(req,res)=>{
    try {
        return res.render('userPanel/userSignUp')
    } catch (err) {
        console.log(err);
        return res.redirect('back');
    }
}

module.exports.createUser = async (req,res)=>{
    try {
        const isExistEmail = await User.find({email:req.body.email}).countDocuments();

        if(isExistEmail!=0){
            console.log("This Email is already exist, try another Email for sign up");
            return res.redirect('back');
        }

        if(req.body.password != req.body.confirmPassword){
            console.log("password and  comfirm password are not same");
            return res.redirect('back');
        }
        

        let imagePath = '';
        if(req.file){
            imagePath = User.imgPath+'/'+req.file.filename;
        }

        req.body.profile_image = imagePath;
        req.body.name = req.body.fName+' '+req.body.lName;

        const createdUser = await User.create(req.body);
        if(createdUser){
            console.log("User Sign Up successfully");
            return res.redirect('/');
        }else{
            console.log("Faild to SignUp");
            return res.redirect('back');
        }

    } catch (err) {
        console.log(err);
        return res.redirect('back');
    }
}

module.exports.userLogin = async(req,res)=>{
    try {
        return res.render('userPanel/userLogin');
    } catch (err) {
        console.log(err);
        return res.redirect('back');
    }
}

module.exports.checkUser = async (req,res)=>{
    try {
        return res.redirect('/')
    } catch (err) {
        console.log(err);
        return res.redirect('back');
    }
}

module.exports.logOutUser = async(req,res)=>{
    try {
        req.session.destroy(err=>err?false:res.redirect('back'))
    } catch (err) {
        console.log(err);
        return res.redirect('back');
    }
}


module.exports.likesBlogComment = async (req,res) =>{
    try{
        let findCommentData = await Comment.findById(req.params.commentId);
        if(findCommentData){
            let checkUserAlreadyExistOrNot = findCommentData.likes.includes(req.user._doc._id);
            if(checkUserAlreadyExistOrNot){
                let newData = findCommentData.likes.filter((v,i)=>{
                    if(!req.user._doc._id.equals(v)){
                        return v;
                    }
                })
                findCommentData.likes = newData;

                // let prime = 1;
                // findCommentData.dislikes.map((v,i)=>{  
                //     if(req.user._doc._id.equals(v)){
                //         prime = 0;
                //     }
                // })
                // if(prime==1){
                //     findCommentData.dislikes.push(req.user._doc._id);
                // }
            }
            else{

                let prime = 1;
                findCommentData.likes.map((v,i)=>{  
                    if(req.user._doc._id.equals(v)){
                        prime = 0;
                    }
                })
                if(prime==1){
                    findCommentData.likes.push(req.user._doc._id);
                }

               
            }

            let DislikescheckUserAlreadyExistOrNot = findCommentData.dislikes.includes(req.user._doc._id);
            if(DislikescheckUserAlreadyExistOrNot){
                let newData = findCommentData.dislikes.filter((v,i)=>{
                    if(!req.user._doc._id.equals(v)){
                        return v;
                    }
                });
                findCommentData.dislikes = newData;

            }
            await Comment.findByIdAndUpdate(req.params.commentId,findCommentData);
            return res.redirect('back');
        }
        else{
            console.log("something wrong");
            return res.redirect('back');
        }
    }
    catch(err){
        console.log(err);
        return res.redirect('back');
    }
}

module.exports.dislikesBlogComment = async (req,res) =>{
    try{
        let findCommentData = await Comment.findById(req.params.commentId);
        if(findCommentData){
            let checkUserAlreadyExistOrNot = findCommentData.dislikes.includes(req.user._doc._id);
            if(checkUserAlreadyExistOrNot){
                let newData = findCommentData.dislikes.filter((v,i)=>{
                    if(!req.user._doc._id.equals(v)){
                        return v;
                    }
                })
                findCommentData.dislikes = newData;

                // let prime = 1;
                // findCommentData.likes.map((v,i)=>{  
                //     if(req.user._doc._id.equals(v)){
                //         prime = 0;
                //     }
                // })
                // if(prime==1){
                //     findCommentData.likes.push(req.user._doc._id);
                // }
            }
            else{

                
                // let newData = findCommentData.likes.filter((v,i)=>{
                //     if(!req.user._doc._id.equals(v)){
                //         return v;
                //     }
                // })
                // findCommentData.likes = newData;


                let prime = 1;
                findCommentData.dislikes.map((v,i)=>{  
                    if(req.user._doc._id.equals(v)){
                        prime = 0;
                    }
                })
                if(prime==1){
                    findCommentData.dislikes.push(req.user._doc._id);
                }
            }
            let likescheckUserAlreadyExistOrNot = findCommentData.likes.includes(req.user._doc._id);
            if(likescheckUserAlreadyExistOrNot){

                let newData = findCommentData.likes.filter((v,i)=>{
                    if(!req.user._doc._id.equals(v)){
                        return v;
                    }
                })
                findCommentData.likes = newData;
            }


            await Comment.findByIdAndUpdate(req.params.commentId,findCommentData);
            return res.redirect('back');
        }
        else{
            console.log("something wrong");
            return res.redirect('back');
        }
    }
    catch(err){
        console.log(err);
        return res.redirect('back');
    }
}
// =//0----------------------