const Category = require('../models/CategoryModel');
const Blog = require('../models/BlogModel');
const fs = require('fs');
const path = require('path');

module.exports.addCategory = async (req,res)=>{
    try {
        return res.render('category/addCategory');
    } catch (err) {
        console.log(err);
        res.locals.flash = req.flash('error',"Something Wrong");
        return res.redirect('back');
    }
}

module.exports.insertCategory= async(req,res)=>{
    try {
        
        const addedCategory = await Category.create(req.body);

        if(addedCategory){
            console.log("Category Added successfully");
            res.locals.flash = req.flash('success',"Category Added successfully");
            return res.redirect('back');
        }else{
            console.log("Faild to add Category");
            res.locals.flash = req.flash('error',"Faild to add Category");
            return res.redirect('back')
        }

    } catch (err) {
        console.log(err);
        res.locals.flash = req.flash('error',"Something Wrong");
        return res.redirect('back');
    }
}

module.exports.viewCategory = async(req,res)=>{
    try {

        let searchValue = '';
        let date;
        let sortType ;

        if(req.query.searchValue){
            searchValue = req.query.searchValue;
        }

        if(req.query.date){
            date = new Date(req.query.date);
        }

        if(req.query.sortType){
            sortType = req.query.sortType
        }

        const allCategory = await Category.find({
            categoryName:{$regex : searchValue,$options:'i'},
            ...(date && {createdAt : {$gte:new Date(date).setHours(0,0,0,0),$lte:new Date(date).setHours(23, 59, 59, 999)}})
        }).sort({...(sortType && {categoryName:parseInt(sortType)})});

    
        return res.render('category/viewCategory',{allCategory,searchValue,date});
    } catch (err) {
        console.log(err);
        res.locals.flash = req.flash('error',"Something Wrong");
        return res.redirect('back');
    }
}

module.exports.changeCategoryStatus = async (req,res)=>{
    try {
        const {id,status} = req.params;
        const changeStatusCategory = await Category.findByIdAndUpdate(id,{status:status});
        if(changeStatusCategory){
            if(status=='false'){
                const updatedCategory = await Category.findById(changeStatusCategory.id);
                await Blog.updateMany({_id:{$in:updatedCategory.blogIds}},{status:status})
            }
            console.log("Category deactived successFully..");
            res.locals.flash = req.flash('success',"Category deactived successFully..");
            return res.redirect('back');
        }else{
            console.log("Faild to deactive Category");
            res.locals.flash = req.flash('error',"Faild to deactive Category");
            return res.redirect('back');
        }
    } catch (err) {
        console.log(err);
        res.locals.flash = req.flash('error',"Something Wrong");
        return res.redirect('back');
    }
}

module.exports.deleteCategory = async(req,res)=>{
    try {
        const deletedCategory = await Category.findByIdAndDelete(req.params.id);
        if(deletedCategory){
            const allBlog = await Blog.find({_id:{$in:deletedCategory.blogIds}});
            allBlog.map(async(item)=>{
                try {
                    const deletePath = path.join(__dirname,"..",item.blog_image);
                    await fs.unlinkSync(deletePath);
                } catch (err) {
                    res.locals.flash = req.flash('error',"Image not found");
                    console.log("Image not found",err);
                }
            });
            await Blog.deleteMany({_id:{$in:deletedCategory.blogIds}});
            console.log("Category Deleted successfully");
            res.locals.flash = req.flash('success',"Category Deleted successfully");
            return res.redirect('back');
        }else{
            console.log("Faild to delete Category");
            res.locals.flash = req.flash('error',"Faild to delete Category");
            return res.redirect('back');
        }
    } catch (err) {
        console.log(err);
        res.locals.flash = req.flash('error',"Something Wrong");
        return res.redirect('back');
    }
}

module.exports.editCategory = async(req,res)=>{
    try {
        const updatedCategory = await Category.findByIdAndUpdate(req.body.id,req.body);
        if(updatedCategory){
            console.log("Category Updated successfully..");
            res.locals.flash = req.flash('success',"Category Updated successfully..");
            return res.redirect('back');
        }else{
            console.log("Faild to update category");
            res.locals.flash = req.flash('error',"Faild to update Category");
            return res.redirect('back');
        }
    } catch (err) {
        console.log(err);
        res.locals.flash = req.flash('error',"Something Wrong");
        return res.redirect('back');
    }
}

module.exports.deactiveAll = async(req,res)=>{
    try {
        const deactiveAllCategory = await Category.updateMany({_id:{$in:req.body.ids}},{status:false});
        if(deactiveAllCategory){
            const allCategory = await Category.find({_id:{$in:req.body.ids}});
            allCategory.map(async(item)=>{
                await Blog.updateMany({_id:{$in:item.blogIds}},{status:item.status});
            })
            console.log("Deactive all category..")
            res.locals.flash = req.flash('success',"Deactive all selected category..");
            return res.redirect('back');
        }else{
            console.log("Faild to deactive all category");
            res.locals.flash = req.flash('error',"Faild to deactive category");
            return res.redirect('back');
        }
    } catch (err) {
        res.locals.flash = req.flash('error',"Something Wrong");
        console.log(err);
        return res.redirect('back');
    }
}

module.exports.allDeactiveCategory = async (req,res)=>{
    try {
        if(req.body.deActive){
            const activeAllCategory = await Category.updateMany({_id:{$in:req.body.ids}},{status:true});
            if(activeAllCategory){
                const allCategory = await Category.find({_id:{$in:req.body.ids}});
                allCategory.map(async(item)=>{
                    await Blog.updateMany({_id:{$in:item.blogIds}},{status:item.status});
                });
                console.log("active all  category..");
                res.locals.flash = req.flash('success',"active all selected category..");
                return res.redirect('back');
            }else{
                console.log("faild to active all selected category");
                res.locals.flash = req.flash('error',"Faild to active all Category");
                return res.redirect('back');
            }
        }else{
            const allCategory = await Category.find({_id:{$in:req.body.ids}});
            const deleteAllCategory = await Category.deleteMany({_id:{$in:req.body.ids}});
            if(deleteAllCategory){
                allCategory.map(async(item)=>{
                    const allBlog = await Blog.find({_id:{$in:item.blogIds}});
                    allBlog.map(async(item)=>{
                        try {
                            const deletePath = path.join(__dirname,"..",item.blog_image);
                            await fs.unlinkSync(deletePath);
                        } catch (err) {
                            res.locals.flash = req.flash('error',"Image not found");
                            console.log("Image not found",err);
                        }
                    });
                    await Blog.deleteMany({_id:{$in:item.blogIds}});
                });
                console.log("Delete All Category..");
                res.locals.flash = req.flash('success',"Delete all selected category..");
                return res.redirect('back');
            }else{
                console.log("Falid to delete all category");
                res.locals.flash = req.flash('error',"Faild to delete all Category");
                return res.redirect('back');
            }
        }

    } catch (err) {
        res.locals.flash = req.flash('error',"Something Wrong");
        console.log(err);
        return res.redirect('back');
    }
}