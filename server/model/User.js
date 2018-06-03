var mongoose = require('mongoose');
const validatorModule = require('validator')
const jwt = require('jsonwebtoken')
const _ = require('lodash')
const bcrypt = require('bcryptjs');
//Stores the schema of User
// var config = require('./../configuration/config.json')

//this absolute path of config.json shld never be executed bcoz while pushing to git
// & heroku we r ignoring this config.json file soo , 
//if used this file path our appl break in production


var UserSchema = new mongoose.Schema({
    email: { //email -> field or property
        type: String,
        required: true,
        minlength: 1,
        trim: true,
        unique: true, //Its Unique field for this field/column -> email
        //custom validator in mongoose
        /* validate : { //syntax of custom validator in mongoose
                        validator: (value) =>{
                                
                        },
                        message : `{VALUE} is not valid email`
                    } */
        /*   validate: { //syntax of custom validator in mongoose
              validator: (value) => {
                  //3rd part custom validator => npm i validator --save
                 let isEmailValid = validatorModule.isEmail(value);
                 return isEmailValid;//true => email is valid, false => email is not valid

              },
              message: `{VALUE} is not valid email`
          } */

        //short-hand notation
        validate: { //syntax of custom validator in mongoose
            validator: validatorModule.isEmail,
            message: `{VALUE} is not valid email`
        }
    },
    password: {
        type: String,
        require: true,
        minlength: 6
    },
    tokens: [{ //tokens is an array
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]

}); //end of UserSchema

//to hide the password,_v,tokens property , while giving the Response body back to client

UserSchema.methods.toJSON = function () {
    var indiviualUserObj = this;
    var jsUserObj = indiviualUserObj.toObject(); //toObject() --> converte the mongoose object
    //end to js object
    var showSpecificPropUserObj = _.pick(jsUserObj, ['_id', 'email']); //picking only specific properties from user object
    //and returning those specific prop as @Response body

    return showSpecificPropUserObj;
}

UserSchema.methods.generateAuthToken = function () {
    //using normal fun bcoz this keyword doesn't supports ==>
    var indiviualUserObj = this;
    var access = 'auth';

    // var jwtToken = jwt.sign({_id : indiviualUserObj._id.toHexString(), access: access}, 'mySalt123').toString();
    //instead of writing the salt here we will be writing it inside the config.json file
    //soo that even though, hacker get this code , they will not get the salt value
    var jwtToken = jwt.sign({
        _id: indiviualUserObj._id.toHexString(),
        access: access
    }, process.env.JWT_SECERT).toString();

/*     console.log("individual user object is " + JSON.stringify(indiviualUserObj, undefined, 2));
    console.log("jwt token value is : " + jwtToken); */

    //this tokens is the property which we have defined in the schema,
    //tokens value will not be entered by the client, rather we need to generate that
    //token value (as jwt encrypted value)

    //push bcoz , tokens is an array
    indiviualUserObj.tokens.push({
        access: access,
        token: jwtToken
    })

    // console.log("----tokens array value is----");

    indiviualUserObj.tokens.forEach(element => {
        // console.log(element);
    });

    return indiviualUserObj.save().then(() => {
        return jwtToken
    }); //need to return the jwtToken value 

} //end of instance method --> generateAuthToken();


//statics -> It used when we want model , instead of instance of userObj/docum
UserSchema.statics.findByToken = function (token) {   //instead of writing the salt here we will be writing it inside the config.json file
    //soo that even though, hacker get this code , they will not get the salt value
    // console.log("Inside findByToken() method");

    var UserModel = this; //User -> caps means it is not instance method, it is model method
    var decoded; //store the jwt decoded value
    /*  console.log(JSON.stringify(UserModel));
     console.log(token); */
    try {
        //    decoded =  jwt.verify(token,'mySalt123'); //this will throw error soo try and catch block used

        //instead of writing the salt here we will be writing it inside the config.json file
        //soo that even though, hacker get this code , they will not get the salt value

        decoded = jwt.verify(token, process.env.JWT_SECERT);
        // console.log(JSON.stringify(decoded));
    } catch (err) {
        return new Promise((resolve, reject) => {
            reject();
        })
    }

    /*     console.log(decoded._id);
        console.log(JSON.stringify(decoded));
        console.log('decode value from jwt is '+ JSON.stringify(decoded)); */
    return UserModel.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });

}


//writting the middleware to mongoose
//this middlware is used to hash the password
//this middleware is executed before/pre event
//here the event is save-> so this middleware is executed before the save event
UserSchema.pre('save', function (next) {
    var user = this;
    //isModified() -> used to chech if a particular property is modified/changed , rt->boolean
    var isPasswordModified = user.isModified('password');
    if (isPasswordModified) {
        var actualPassword = user.password;
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(actualPassword, salt, (err, hashValue) => {
                // console.log(hashValue);
                user.password = hashValue; //update the userObj password property with the hashedPassword value
                next();
            })
        })

    } else {
        next();
    }
});

//authenticating login credentials by creating a separate method
UserSchema.statics.findByCredentials = function (enteredEmail, enteredPassword) {
    var UserModel = this; //model method bcoz

    //first we need to get the userObject/document for the particular email passed/entered
    var promiseObj = UserModel.findOne({
        'email': enteredEmail
    })

    return promiseObj.then((userObj) => {

        if (!userObj) { //if entered emailId doesnot exist in the DB
            // console.log('from If block');
            return Promise.reject('emailId not found in the DB');

            //above code is similar to (check the 'new' keyword usage)
            /*  return new Promise((resolve,reject)=>{
                 reject('emailId not found in the DB');
             }) */

        }

        //entered emailId do exist in the DB
        //happy-path (success-senario)
        //let us write the bcrypt comparsion inside the Promise sandwich
        return checkThePassword(enteredPassword, userObj); //to refactor the code -> select the portion of the code > right click > refactor > extract to function in global scope

    }) //end of then()

}


function checkThePassword(enteredPassword, userObj) {
    return new Promise((resolve, reject) => {
        bcrypt.compare(enteredPassword, userObj.password, (err, result) => {
            //result is boolean
            // console.log('did password matched : ' + result);
            if (result) {
                resolve(userObj);
            } else {
                reject("password did not match");
            }
        });
    });
}


UserSchema.methods.removeToken = function (enteredToken) {
    //In this method we want to remove then token value from the tokens array which has the same token value as entered/passed
    //we are using mongodb-operator -> $pull 
    //$pull will remove the items from the array which matches the criteria
    var userObj = this;

    return userObj.update({
        $pull: {
            //we define what we want to pull
            //we are pulling/removing the token value from the userObj/document , when enteredToken(from request.header) <=(matches)=> token (which is present in the DB)
            tokens: {
                token: enteredToken
            }
        }
    })



}

//User model/dto/Obj of JS is mapped to user_collec in mongodb
var User = mongoose.model('user_collec', UserSchema)

module.exports = {
    User
}