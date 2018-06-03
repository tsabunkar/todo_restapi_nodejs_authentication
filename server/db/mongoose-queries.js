const {ObjectID} = require('mongodb')

const {mongoose} = require('./mongoose_config');
const {Todo} = require('../model/Todo');

var idToFetch = '5aefee44ebe0cd3c549dcc75';

//How to valid ObjecId entere is valid or not

if(!ObjectID.isValid(idToFetch)){
    console.log('ID is not valid');
    process.exit(); //Abruptly exiting/stopping the excution flow from here !!
    //thus rest of the pgm will not be executed 

    //or to terminate u can use
    // process.kill();
}


Todo.find({ //We no need to manually convert the string to ObjectId as we use todo in mongoDb
            //Mongoose will implicitly do this casting for us (since Mongoose has typecasting feature)
    _id : idToFetch
}).then((result) => {
    console.log(result);
}).catch((err) => {
    console.log(err);
}); //It will return array which contain only one docum (bcoz finding with unqiue ObjectId)


Todo.findOne({_id : idToFetch}).then((result) => {
    console.log(result);
}).catch((err) => {
    console.log(err);
});//It will return Object (ie document) 


//If we want to find a doc only by using ObjectIDz
Todo.findById(idToFetch).then((todoObj) => {
    if(!todoObj){ //If the _id is not present in the db   ex -> 6aefee44ebe0cd3c549dcc75 (invalid Id no)
         console.log("this Id docum is not found the Db!!");  
         return; //return from this fun , without executing the below line of codes
    }
    console.log(todoObj);

}).catch((err) => { //this catch block is executed if _id
    // value is '5aefee44ebe0cd3c549dcc751' 15 digit no instead of 16 digit no
    console.log(err);
});