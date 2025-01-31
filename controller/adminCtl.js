const Admin = require("../models/AdminModel");
const nodemailer = require("nodemailer");
const Cryptr = require('cryptr');
const cryptr = new Cryptr('secretKeysdskjghsdgjh')
const path = require('path');
const fs = require('fs');
const moment =  require('moment');
const Blog = require('../models/BlogModel');
const Category = require('../models/CategoryModel');

module.exports.dashBoard = async (req,res)=>{
    try {
        const totalBlog = await Blog.find({status:true}).countDocuments();
        const totalCategory =await Category.find({status:true}).countDocuments();

        const allCategory = await Category.find({status:true});

        const lables = allCategory.map((item)=>item.categoryName);
        const values = allCategory.map((item)=>item.blogIds.length);
        return res.render('admin/dashboard',{
            totalBlog,
            totalCategory,
            lables,
            values
        });
       
    } catch (err) {
        console.log("Something wrong",err);
        return res.redirect('back');
    }
}

module.exports.addAdmin = async(req,res)=>{
    try {
      
        return res.render('admin/addAdmin');
       
    } catch (err) {
        console.log("Something wrong",err);
        return res.redirect('back');
    }
}

module.exports.insertAdmin = async (req,res)=>{
    try {
        let imagePath = '';
        if(req.file){
            imagePath = Admin.imgPath+'/'+req.file.filename;
        }

        req.body.admin_image = imagePath;
        req.body.name = req.body.fName+' '+req.body.lName;

        const addedAdminData = await Admin.create(req.body);
        if(addedAdminData){
            console.log("Admin redord add successfully..");
            return res.redirect('/viewAdmin');
        }else{
            console.log("Admin record not add faild....");
            return res.redirect('back');
        }

    } catch (err) {
        console.log("Something wrong",err);
        return res.redirect('back');
    }
}

module.exports.viewAdmin = async (req,res)=>{
    try {

        let searchValue = '';
        let page = 0;
        let perPageData = 4;
        let sort,date;

        if(req.query.search){
            searchValue = req.query.search;
        }

        if(req.query.page){
            page = req.query.page;
        }

        if(req.query.sort){
            sort = parseInt(req.query.sort);
        }

        if(req.query.date){
            date = req.query.date;
        }

        const allAdminRecord = await Admin.find({
            ...(date&&{date:{$gte:date,$lte:date}}),
            $or:[
                {name:{$regex:searchValue,$options:'i'}},
                {gender:{$regex:searchValue,$options:'i'}},
                {hobby:{$regex:searchValue,$options:'i'}},
                {city:{$regex:searchValue,$options:'i'}},
                {about:{$regex:searchValue,$options:'i'}},
            ]
        }).sort({...(sort&&{name:sort})}).skip(perPageData*page).limit(perPageData);

        const allAdminCount = await Admin.find({
            ...(date&&{date:{$gte:date,$lte:date}}),
            $or:[
                {name:{$regex:searchValue,$options:'i'}},
                {gender:{$regex:searchValue,$options:'i'}},
                {hobby:{$regex:searchValue,$options:'i'}},
                {city:{$regex:searchValue,$options:'i'}},
                {about:{$regex:searchValue,$options:'i'}},
            ]
        }).countDocuments();

        const totalAdminPage = Math.ceil(allAdminCount/perPageData);

        return res.render('admin/viewAdmin',{allAdminRecord,searchValue,page:parseInt(page),totalAdminPage,sort,date});
      
    } catch (err) {
        console.log("Something wrong",err);
        return res.redirect('back');
    }
}

module.exports.deleteAdmin = async (req,res)=>{
    try {
        const id = req.params.id;
        const adminData = await Admin.findById(id);
        try {
            const deleteImagePath = path.join(__dirname,'..',adminData.admin_image);
            await fs.unlinkSync(deleteImagePath);
        } catch (err) {
            console.log("Image not found");
        }

        const deletedAdminData = await Admin.findByIdAndDelete(id);

        if(deletedAdminData){
            console.log("Admin record deleted successfully..");
            return res.redirect('back')
        }else{
            console.log("Admin record deleted successfully..");
            return res.redirect('back')
        }

    } catch (err) {
        console.log("Something wrong",err);
        return res.redirect('back');
    }
}


module.exports.updateAdmin = async (req,res)=>{
    try {
        const adminData = await Admin.findById(req.params.id);
        return res.render('admin/editAdmin',{adminData});
    } catch (err) {
        console.log("Something wrong",err);
        return res.redirect('back');
    }
}

module.exports.editAdmin = async (req,res)=>{
    try {
        const adminData = await Admin.findById(req.body.id);
        if(req.file){
            try {
                const deleteImagePath = path.join(__dirname,'..',adminData.admin_image);
                await fs.unlinkSync(deleteImagePath);
            } catch (err) {
                console.log("Image not Found",err);
            }

            const newImagePath = Admin.imgPath+'/'+req.file.filename;
            req.body.admin_image = newImagePath;

        }else{
            req.body.admin_image = adminData.admin_image;
        }

        req.body.name = req.body.fName+' '+req.body.lName;

        const beforeUpdateAdminData = await Admin.findByIdAndUpdate(req.body.id,req.body);
        if(beforeUpdateAdminData){
            const updatedAdminData = await Admin.findById(beforeUpdateAdminData.id);
            const cookieAdminData = req.user;
            if(cookieAdminData.id===updatedAdminData.id){
                console.log("cookie update")
                return res.redirect('/myProfile');
            }
            console.log("Admin Record updated..");
            return res.redirect('/viewAdmin');
        }else{
            console.log("Faild to update Admin record...");
            return res.redirect('back');
        }


    } catch (err) {
        console.log("Something wrong",err);
        return res.redirect('back');
    }
}

module.exports.deleteAllAdmin = async(req,res)=>{
    try {
        console.log(req.body)
        const allDeleteAdmin = await Admin.find({_id:{$in:req.body.ids}});
        allDeleteAdmin.map(async (item)=>{
            try {
                const deletePath = path.join(__dirname,'..',item.admin_image);
                await fs.unlinkSync(deletePath);
            } catch (err) {
                console.log("Image not found");
            }
        })

        const deletedAdmins = await Admin.deleteMany({_id:{$in:req.body.ids}});
        if(deletedAdmins){
            console.log("delete all admins..");
            return res.redirect('back');
        }else{
            console.log("faild to delete admins");
            return res.redirect('back');
        }
    } catch (err) {
        console.log("Something wrong",err);
        return res.redirect('back');
    }
}


// login system -------------------

module.exports.login = async (req,res)=>{
    try {
        
            return res.render('loginSystem/login');
        
    } catch (err) {
        console.log("Something wrong",err);
        return res.redirect('back');
    }
}

module.exports.checkLogin = async(req,res)=>{
    try {
        return res.redirect('/dashBoard');
       
    } catch (err) {
        console.log("Something wrong",err);
        return res.redirect('back');
    }
}

module.exports.logOut = async(req,res)=>{
    try {
        req.session.destroy((err)=>{
            if(err){
                return false;
            }
            return res.redirect('/login');
        })
    } catch (err) {
        console.log("Something wrong",err);
        return res.redirect('back');
    }
}

//----------------


// showing profile -------------

module.exports.myProfile = async (req,res)=>{
    try {
     
            return res.render('admin/myProfile');
       
    } catch (err) {
        console.log("Something Wrong",err)
        return res.redirect('back');
    }
}

// -----------------------


// change password ------------------------------

module.exports.checkPassword = async(req,res)=>{
    try {
      
            return res.render('loginSystem/checkPassword')         
    } catch (err) {
        console.log("Something Wrong",err);
        return res.redirect('back');
    }
}

module.exports.verifyNewPassword = async (req,res)=>{
    try {
        const {currentPassword,newPassword,confirmPassword} = req.body;
        const adminData = req.user;

        if(adminData.password != currentPassword){
            console.log("current pass not math with old password...");
            return res.redirect('back');
        }

        if(currentPassword === newPassword){
            console.log("Current and New Password are same try another password...");
            return res.redirect('back');
        }

        if(newPassword === confirmPassword){
            const updatePassword = await Admin.findByIdAndUpdate(adminData._id,{password:newPassword});
            if(updatePassword){
                console.log("Password Changed Successfully....");
                res.clearCookie('adminData');
                return res.redirect('/login');
            }else{
                console.log("Password Changed faild...");
                return res.redirect('back');
            }
        }else{
            console.log("New and Confirm Password are not match...");
            return res.redirect('back');
        }

    } catch (err) {
        console.log("Something Wrong",err);
        return res.redirect('back')
    }
}

//------------------------------

// forget passwrod ---------------------------

module.exports.checkEmail = async (req,res)=>{
    try {
        return res.render('loginSystem/checkEmail');
    } catch (err) {
        console.log("Something Wrong",err);
        return res.redirect('back');
    }
}

module.exports.verifyEmail = async (req,res)=>{
    try {
        const isAdminExistCount = await Admin.find({email:req.body.email}).countDocuments();
        if(isAdminExistCount == 1){
            const adminData = await Admin.findOne({email:req.body.email});
            
            let OTP = Math.floor(Math.random()*10000);
            const otpGanretor = (otp)=>{
                if(OTP.toString().length == 4){
                    console.log("object")
                    return;
                }
                OTP = Math.floor(Math.random()*10000);
                otpGanretor();
            }
            otpGanretor();

            
            const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 587,
                secure: false, // true for port 465, false for other ports
                auth: {
                  user: "kidecharakesh2002@gmail.com",
                  pass: "tvaursfutsszvyiv",
                },
                tls:{
                    rejectUnauthorized: false
                }
            });

            const info = await transporter.sendMail({
                from: 'kidecharakesh2002@gmail.com', // sender address
                to: adminData.email, // list of receivers
                subject: "Verify OTP", // Subject line
                html: `<p>Your verify OTP for Frorget Password is <b>${OTP}</b></p>`, // html body
            });

            console.log("Message sent: %s", info.messageId);

            res.cookie('verificationOtp',cryptr.encrypt(JSON.stringify(OTP)),{ expires: new Date(new Date().getTime()+30*1000), httpOnly: true });
            res.cookie('adminEmail',cryptr.encrypt(JSON.stringify(adminData.email)));

            return res.redirect('/checkOtp');

        }else{
            console.log("Invalid Email...");
            return res.redirect('back');
        }

    } catch (err) {
        console.log("Something Wrong",err);
        return res.redirect('back')
    }
}

module.exports.checkOtp = async (req,res)=>{
    try {   

        var isOtpCookie  = true;

        if(!req.cookies.verificationOtp){
            isOtpCookie = false;
        }

        const adminEmail = JSON.parse(cryptr.decrypt(req.cookies.adminEmail));
        return res.render('loginSystem/checkOtp',{adminEmail,isOtpCookie});
    } catch (err) {
        console.log("Something Wrong",err);
        return res.redirect('back')
    }
}

module.exports.verifyOtp = async (req,res)=>{
    try {
        if(!req.cookies.verificationOtp){
            console.log("Something Wrong OR OTP otp could be expried Please try again");
            return res.redirect('back');
        }

        const verificationOtp = JSON.parse(cryptr.decrypt(req.cookies.verificationOtp));

        if(verificationOtp==req.body.otp){
            res.clearCookie('verificationOtp');
            return res.redirect('/forgetPassword');
        }else{
            console.log("Invalid OTP..");
            return res.redirect('back')
        }
    } catch (err) {
        console.log("SOmething Wrong",err);
        return res.redirect('back');
    }
}

module.exports.forgetPassword = async (req,res)=>{
    try {
        return res.render('loginSystem/forgetPassword');
    } catch (err) {
        console.log("Something Wrong",err);
        return res.redirect('back');
    }
}

module.exports.setNewPassword = async (req,res)=>{
    try {   

        if(!req.cookies.adminEmail){
            console.log("Something Wrong Please try again");
            return res.redirect('/login');
        }

        const adminEmail = JSON.parse(cryptr.decrypt(req.cookies.adminEmail));
        
        if(req.body.newPassword === req.body.confirmPassword){
            const isExistAdminCount = await Admin.find({email:adminEmail}).countDocuments();

            if(isExistAdminCount == 1){
                const adminData = await Admin.findOne({email:adminEmail});

                const updatePassword = await Admin.findByIdAndUpdate(adminData.id,{password:req.body.newPassword});

                if(updatePassword){
                    console.log("Password Updated successfully..");
                    res.clearCookie('adminEmail');
                    return res.redirect('/login');
                }else{
                    console.log("Password Updation Faild...");
                    return res.redirect('back');
                }
               
            }else{
                console.log("Inavlid Email..");
                return res.redirect('/checkEmail');
            }
        }else{
            console.log("New and Confirm Password not match...");
            return res.redirect('back');
        }
        
    } catch (err) {
        console.log("SOmething Wrong",err);
        return res.redirect('back');
    }
}

// ----------------------------------------