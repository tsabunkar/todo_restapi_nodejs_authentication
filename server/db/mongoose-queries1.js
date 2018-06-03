const {ObjectID} = require('mongodb')


const { mongoose } = require('./mongoose_config');
const { User } = require('../model/User');
const {Todo} = require('../model/Todo');

var idToFetch = '5af04b5c95ac9fb50f85b345'

// var idToFetch = '5aefee44ebe0cd3c549dcc75';

// console.log(User);
User.findById(new ObjectID(idToFetch)).then((userObj) => {
    if (!userObj) {
        console.log("this Id docum is not found the Db!!");
        return;
    }
    console.log(userObj);

}).catch((err) => {
    console.log(err);
});