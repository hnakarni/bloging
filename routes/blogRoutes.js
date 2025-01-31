const express = require('express');
const BlogCtl = require('../controller/blogCtl');
const Blog = require('../models/BlogModel');
const router = express.Router();

router.get('/',BlogCtl.addBlog);

router.post('/insertBlog',Blog.uploadImage,BlogCtl.insertBlog);

router.get('/viewBlog',BlogCtl.viewBlog);

router.get('/changeBlogStatus/:id/:statusType',BlogCtl.changeBlogStatus);

router.get('/deleteBlog/:id',BlogCtl.deleteBlog);

router.get('/updateBlog/:id',BlogCtl.updateBlog);

router.post('/editBlog',Blog.uploadImage,BlogCtl.editBlog); 

router.post('/deactiveAllBlog',BlogCtl.deactiveAllBlog);

router.post('/oprateAllDeactiveBlog',BlogCtl.oprateAllDeactiveBlog);

module.exports  = router;