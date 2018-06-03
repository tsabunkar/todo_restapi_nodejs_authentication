var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
const url = process.env.MONGODB_URI;
//  const url = 'mongodb://tsabunkar:icui4cuNOW@ds245240.mlab.com:45240/mongodbhost' ;


mongoose.connect(url);
//for production env, we are using the mongodb uri as -> process.env.MONGODB_URI

module.exports = { mongoose }; 