const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/LTE_AdminPanel');

const db = mongoose.connection;

db.once('open',err=>console.log(err?err:"Mongodb connected successfully..."));

module.exports = db;