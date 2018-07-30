require('./configuration/config')

const port = process.env.PORT;
//this variable will be set , if the appln is running on the heroku
//It wont be set, if it is running on local

const _ = require('lodash')
const {
    ObjectID
} = require('mongodb')
const express = require('express');
const bcrypt = require('bcryptjs')
//body-parser let us to send JSON to server, then server can take this JSON data and do processing
//body-parser -> parses the  body  ie take JSON body convert to  JS Object
const bodyParser = require('body-parser')

const {
    mongoose
} = require('./db/mongoose_config');
const {
    Todo
} = require('./model/Todo');
const {
    User
} = require('./model/User');
const {
    authenticate
} = require('./middleware/authenticate')

var app = express();

//To register the middleware
app.use(bodyParser.json()); //We are setting middleware from client request to 








//REST API ==>

//------------------------------------todos(API)--------------------------------------------------------------



//POST HTTP METHOD     
//localhost:3000/todos                                                                                                                                                                                                                                                                                                                                                                                                                           
app.post('/todos', authenticate, (request, response) => {
    /* console.log("Request body is :- ");
    console.log(request.body);  */ //here we get the POST request which has been send from client in JSON 
    //format (but got converted to JS Object using body-parser middleware)
    //create an instance of mongoose Model
    var todoObj = new Todo({
        text: request.body.text,
        completed: request.body.completed,
        completedAt: request.body.completedAt,
        _creator: request.user_Obj._id //linking with User model
    })

    todoObj.save().then((result) => {
        /*  console.log("Response body is :- ");
         console.log(result); */
        response.send(result); //Here we are sending back the saved document result back to the client 
        //ie- we are resonding for the request send by the client
        // mongoose.connection.close();
    }).catch((err) => {
        /*   console.log("Response body is :- ");
          console.log(err); */
        response.status(400).send(err);
        // mongoose.connection.close();

    });
})


//GETALL
//GET HTTP METHOD
//localhost:3000/todos     
app.get('/todos', authenticate, (request, response) => {

    // console.log(request.user_Obj._id);
    //fetching all the documents from the todo collection
    Todo.find({ //finding all the document of that particular user obj, soo specifiying the query here
        _creator: request.user_Obj._id
    }).then((mytodo) => {
        // console.log(mytodo);
        response.send({
            mytodo,
            "isEverythingOk": true
        }) //mytodo variable name will be the propertyname for listofdocuments 
        // mongoose.connection.close();// IF u close the connection we cannot make any other 
        //GET request from the client side

    }).catch((err) => {
        // console.log(err);
        response.status(400).send(err);
        // mongoose.connection.close();

    });
})


//GETONE
//GET /todos/123
//localhost:3000/todos/5b28b7b83428d43b38f41665
app.get('/todos/:todoId', authenticate, (request, response) => {
    /*  console.log(request.params); //gives the url parameters
     console.log(request.params.todoId); */
    var uriIdFetch = request.params.todoId;
    if (!ObjectID.isValid(uriIdFetch)) { //If Id is not valid format then exec this if body
        response.status(404).send({
            error: 'Id Format is not valid',
            isEveryThingOk: false
        });
        // console.log('Id Format is not valid');
        return
    }

    // Todo.findById(uriIdFetch).then((todoObj) => {

    /* above code works well , but we need to authenticate to show todo's docum of that particular User
    soo changing the findById() -> findOne()
    also specifiying the two criteria's */

    Todo.findOne({
        _id: uriIdFetch,
        _creator: request.user_Obj._id
    }).then((todoObj) => {
        if (!todoObj) {
            //If document is empty 
            response.status(404).send({
                error: 'Id format is valid but no docu found with this id',
                isEveryThingOk: false
            });
            // console.log('Id format is valid but no docu found with this id');
            return
        }
        //success
        response.send({
            myTodoObj: todoObj,
            isEveryThingOk: true
        })
    }).catch((err) => {
        response.status(400).send(err);
    });

})


//DELETE
//http://localhost:3000/todos/5b28b7d83428d43b38f41666
app.delete('/todos/:todoId', authenticate, (request, response) => {
    var uriIdToDelete = request.params.todoId;
    if (!ObjectID.isValid(uriIdToDelete)) { //If Id is not valid format then exec this if body
        response.status(404).send({
            error: 'Id Format is not valid',
            isEveryThingOk: false
        });
        // console.log('Id Format is not valid');
        return
    }

    // Todo.findByIdAndRemove(uriIdToDelete).then((todoObjDeleted) => {

    /* above code works well , but we need to authenticate soo that particular User can only delete his 
    doucments only , without allowing him to delete some1 else user docum
    soo changing the findByIdAndRemove() -> findOneAndRemove()
    also specifiying the two criteria's */

    Todo.findOneAndRemove({
        _id: uriIdToDelete,
        _creator: request.user_Obj._id
    }).then((todoObjDeleted) => {
        if (!todoObjDeleted) {
            //If document is empty 
            response.status(404).send({
                error: 'Id format is valid but no docu found with this id',
                isEveryThingOk: false
            });
            // console.log('Id format is valid but no docu found with this id');
            return
        }
        //success
        response.send({
            myTodoObj: todoObjDeleted,
            isEveryThingOk: true
        })
    }).catch((err) => {
        response.status(400).send(err);
    });
})


//UPDATE --> Uses HTTP Patch Method
//http://localhost:3000/todos/5b28b7b83428d43b38f41665
app.patch('/todos/:todoId', authenticate, (request, response) => {
    var uriIdToUpdate = request.params.todoId;
    //pick method will take/pick 2nd argum array value (which are prroperty name in request body ) from the request body

    var rxedbody = _.pick(request.body, ['text', 'completed', 'completedAt'])
    /* console.log("Rxedbody is --------------------------------------");
    console.log(rxedbody); */
    if (!ObjectID.isValid(uriIdToUpdate)) { //If Id is not valid format then exec this if body
        response.status(404).send({
            error: 'Id Format is not valid',
            isEveryThingOk: false
        });
        // console.log('Id Format is not valid');
        return
    }

    /*   if (_.isBoolean(rxedbody.completed) && rxedbody.completed == true) {
          //if rxedbody.completed is boolean type and also its true
          rxedbody.completedAt = new Date().getTime();
      } else {
          rxedbody.completed = false;
          rxedbody.completedAt = null;
      }
   */

    // {new: true} --> will show/return the updated document, instead of orignalDocument /Previous docu

    // Todo.findByIdAndUpdate(uriIdToUpdate, {

    /* above code works well , but we need to authenticate soo that particular User can only update his 
    doucments only , without allowing him to update some1 else user docum
    soo changing the findByIdAndUpdate() -> findOneAndUpdate()
    also specifiying the two criteria's */

    Todo.findOneAndUpdate({
        _id: uriIdToUpdate,
        _creator: request.user_Obj._id
    }, {
        $set: rxedbody
    }, {
        new: true
    }).then((updatedtodoObj) => {
        if (!updatedtodoObj) {
            response.status(404).send({
                error: 'Id format is valid but no docu found with this id',
                isEveryThingOk: false
            });
            return;
        }
        //success
        response.send({
            myTodoObj: updatedtodoObj,
            isEveryThingOk: true
        })
    }).catch((err) => {
        response.status(400).send(err);
    });

});

//------------------------------------users(API)--------------------------------------------------------------

//POST /users
//public route for signup
//http://localhost:3000/users/signup
app.post('/users/signup', (request, response) => {
    /*   console.log("Request body is :- ");
     console.log(request.body); */
    var rxedbody = _.pick(request.body, ['email', 'password'])
    /*  console.log("-------");
     console.log(rxedbody); */

    /*  var userObj = new User({
         email : rxedbody.email,
         password : rxedbody.password
     }) */
    //directly we can do CI of the rxedBody object into User Object/Model

    var userObj = new User(rxedbody);

    userObj.save().then((userObj) => {
        return userObj.generateAuthToken();

        /*  console.log("Response body is :- ");
         console.log(userObj); */
        // response.send(userObj); //used to send the userInstnace which has been saved
        //back to the client as response
        //recursive then()                             
    }).then((mytoken) => {
        // console.log("My token value in http header @Response " + mytoken);
        response.header('x-auth', mytoken).send(userObj);

    }).catch((err) => {
        // console.log("Response body is :");
        response.status(400).send(err)
    })
})



//private route
//GET method
//http://localhost:3000/users/me
app.get('/users/me', authenticate, (request, response) => {
    /* console.log(request.user_Obj);
    console.log(response.token_Val); */
    response.send(request.user_Obj);
})



//POST method
//login mechanism , verfiaction of username and password
//http://localhost:3000/users/login
app.post('/users/login', (request, response) => {
    var emailPassVal = _.pick(request.body, ['email', 'password']);
    // console.log(JSON.stringify(emailPassVal, undefined, 2));

    var promiseObj = User.findByCredentials(emailPassVal.email, emailPassVal.password);

    promiseObj.then((user) => {
        // response.send(user); //if promise is resolved then this part of code will be executed

        //instead of sending only the response body, we need to also send the x-auth token value, inorder
        //to use this x-auth token for next request verification.  
        return user.generateAuthToken().then((token) => {
            response.header('x-auth', token).send(user)
        })
        /* .catch((err) => {
                    
                }); */ //using single catch (i.e-Promise chaining)


    }).catch((err) => {
        // console.log("---------from catch block-----------");
        // console.log(err); //if promise false/rejected then this part of the code will be executed
        response.status(400).send(err);
    });

})


//logout, since we are removing a user session soo it is DELETE http method
//we will be deleting the token of the currently login user
//token is used to maintain session of the particular user when he logs-in
//make this api as private -> just by introducing the authenticate method as argument
//http://localhost:3000/users/me/logout
app.delete('/users/me/logout', authenticate, (request, response) => {
    /*  console.log("---welcome to delete token method----");
     console.log(request.user_Obj);
     console.log("------");
     console.log(request.token_Val); */
    //we need to use -> user_Obj, token_Val bocz this request is going to
    //authenicate middleware
    var promiseObj = request.user_Obj.removeToken(request.token_Val);

    promiseObj.then(() => {
        response.status(200).send({
            message: 'Logged out successfully',
            isEveryThingOk: true
        })
    }).catch(() => {
        response.status(400).send({
            message: 'logout failed',
            isEveryThingOk: false
        });
    });

});




app.listen(port, () => {
    console.log(`Running @${port} port`);
});

module.exports = {
    app
}


//=====================================================================================
/* 
[steps to GETALL todos docu of particular user]

step 1)
{{url}}/users   ==> POST

Request Body
{ 
    "email": "tsabunkar@gmail.com",
    "password": "pas123"
}
o/p->
copy the response header -> x-auth token value

step 2)
{{url}}/todos   ==> POST

Request Header
x-auth  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (paste the token value here)
Request Body
{ 
    "text": "running",
    "completed": true,
      "completedAt":12
}
 
step 3)
(repeat the same steps by login in with different user)

step 4) [To check the GET for particular todo, showing todo docum's of only that particular user]
{{url}}/todos    ==> GET

Request Header
x-auth  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (paste the token value here)

o/p-> 
instead of getting the document for all the todo obj , we will be getting 
only for that specific user (which is been passed/entered in the Request header as-> x-auth token value)


 */


 //===========================================(TEST)========================================================

 app.post('/todos_test', (request, response) => {
    /* console.log("Request body is :- ");
    console.log(request.body);  */ //here we get the POST request which has been send from client in JSON 
    //format (but got converted to JS Object using body-parser middleware)
    //create an instance of mongoose Model
    var todoObj = new Todo({
        text: request.body.text,
        completed: request.body.completed,
        completedAt: request.body.completedAt,
        // _creator: request.user_Obj._id //linking with User model
    })

    todoObj.save().then((result) => {
        /*  console.log("Response body is :- ");
         console.log(result); */
        response.send(result); //Here we are sending back the saved document result back to the client 
        //ie- we are resonding for the request send by the client
        // mongoose.connection.close();
    }).catch((err) => {
        /*   console.log("Response body is :- ");
          console.log(err); */
        response.status(400).send(err);
        // mongoose.connection.close();

    });
})