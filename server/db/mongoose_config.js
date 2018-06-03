var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/mymongodb'
mongoose.connect(url);
//for production env, we are using the mongodb uri as -> process.env.MONGODB_URI

module.exports = { mongoose }; 