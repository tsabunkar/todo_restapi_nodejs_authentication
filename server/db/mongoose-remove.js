const {ObjectID} = require('mongodb')

const { mongoose } = require('./mongoose_config');
const {Todo} = require('../model/Todo');

var idToDelete = '5aef034a5949713f8ccefccd'

//all the document will be removed
/* Todo.remove({}).then((result) => {
    console.log(result);
}).catch((err) => {
    console.log(err);
}); */

//to remove one particular docum using ObjectId
/* Todo.findOneAndRemove({_id : idToDelete}).then((result) => {
    console.log(result);
}).catch((err) => {
    console.log(err);
}); */

//findOneAndRemove works same as findByIdAndRemove but only diff is syntax

Todo.findByIdAndRemove(idToDelete).then((result) => {
    console.log(result);
}).catch((err) => {
    console.log(err);
});