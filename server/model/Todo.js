var mongoose = require('mongoose');

var TodoSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Number,
        default: null
    },
 /*    //this prroperty tells that, user who has created this particular document
    _creator : {
        //Inorder to identify the the paricular User, we are using the ObjectId of the User document/obj
        //type -> is of Type -> Object
        type : mongoose.Schema.Types.ObjectId,
        required : true
    } */
}); //end of TodoSchema

var Todo = mongoose.model('todo_collecs',TodoSchema);

module.exports = {
    Todo
}