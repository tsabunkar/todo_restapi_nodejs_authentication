require('./configuration/config')

const port = process.env.PORT;

const _ = require('lodash')
const {
    ObjectID
} = require('mongodb')
const express = require('express');
const bcrypt = require('bcryptjs')

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
app.post('/todos', authenticate, async (request, response) => {

    var todoObj = new Todo({
        text: request.body.text,
        completed: request.body.completed,
        completedAt: request.body.completedAt,
        _creator: request.user_Obj._id //linking with User model
    })

    try {
        let savedObj = await todoObj.save()
        response.send(savedObj);
    }
    catch (err) {
        response.status(400).send(err);
    }
})


//GETALL
//GET HTTP METHOD
//localhost:3000/todos     
app.get('/todos', authenticate, async (request, response) => {

    try {
        let mytodo = await Todo.find({
            _creator: request.user_Obj._id
        })
        response.send({
            mytodo,
            "isEverythingOk": true
        })
    }
    catch (err) {
        response.status(400).send(err);
    }
})


//GETONE
//GET /todos/123
//localhost:3000/todos/5b28b7b83428d43b38f41665
app.get('/todos/:todoId', authenticate, async (request, response) => {

    var uriIdFetch = request.params.todoId;

    if (!ObjectID.isValid(uriIdFetch)) {
        response.status(404).send({
            error: 'Id Format is not valid',
            isEveryThingOk: false
        });
        return
    }

    try {
        let todoObj = await Todo.findOne({
            _id: uriIdFetch,
            _creator: request.user_Obj._id
        });

        if (!todoObj) {
            //If document is empty 
            response.status(404).send({
                error: 'Id format is valid but no docu found with this id',
                isEveryThingOk: false
            });
            return
        }
        //success
        response.send({
            myTodoObj: todoObj,
            isEveryThingOk: true
        })
    }
    catch (err) {
        response.status(400).send(err);
    }
})


//DELETE
//http://localhost:3000/todos/5b28b7d83428d43b38f41666
app.delete('/todos/:todoId', authenticate, async (request, response) => {

    var uriIdToDelete = request.params.todoId;
    if (!ObjectID.isValid(uriIdToDelete)) { //If Id is not valid format then exec this if body
        response.status(404).send({
            error: 'Id Format is not valid',
            isEveryThingOk: false
        });
        return
    }

    try {
        let todoObjDeleted = await Todo.findOneAndRemove({ //findOneAndRemove() fun return promise Object so, use await :)
            _id: uriIdToDelete,
            _creator: request.user_Obj._id
        })

        if (!todoObjDeleted) {
            //If document is empty 
            response.status(404).send({
                error: 'Id format is valid but no docu found with this id',
                isEveryThingOk: false
            });
            return
        }
        //success
        response.send({
            myTodoObj: todoObjDeleted,
            isEveryThingOk: true
        })
    }
    catch (err) {
        response.status(400).send(err);
    }
})


//UPDATE --> Uses HTTP Patch Method
//http://localhost:3000/todos/5b28b7b83428d43b38f41665
app.patch('/todos/:todoId', authenticate, async (request, response) => {
    var uriIdToUpdate = request.params.todoId;
    //pick method will take/pick 2nd argum array value (which are prroperty name in request body ) from the request body

    var rxedbody = _.pick(request.body, ['text', 'completed', 'completedAt'])
    if (!ObjectID.isValid(uriIdToUpdate)) { //If Id is not valid format then exec this if body
        response.status(404).send({
            error: 'Id Format is not valid',
            isEveryThingOk: false
        });
        return
    }
    try {
        let updatedtodoObj = await Todo.findOneAndUpdate({
            _id: uriIdToUpdate,
            _creator: request.user_Obj._id
        }, {
                $set: rxedbody
            }, {
                new: true
            })

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
    }
    catch (err) {
        response.status(400).send(err);
    }
});

//------------------------------------users(API)--------------------------------------------------------------

//POST /users
//public route for signup
//http://localhost:3000/users/signup
app.post('/users/signup', async (request, response) => {
    try {
        var rxedbody = _.pick(request.body, ['email', 'password'])
        var userObj = new User(rxedbody);
        await userObj.save();
        let mytoken = userObj.generateAuthToken();
        response.header('x-auth', mytoken).send(userObj);
    }
    catch (err) {
        response.status(400).send(err)
    }
})



//private route
//GET method
//http://localhost:3000/users/me
app.get('/users/me', authenticate, (request, response) => {
    response.send(request.user_Obj);
})



//POST method
//login mechanism , verfiaction of username and password
//http://localhost:3000/users/login
app.post('/users/login', async (request, response) => {
    try {
        var emailPassVal = _.pick(request.body, ['email', 'password']);
        var user = await User.findByCredentials(emailPassVal.email, emailPassVal.password);
        var token = await user.generateAuthToken()
        response.header('x-auth', token).send(user)
    }
    catch (err) {
        response.status(400).send(err);
    }
})


//http://localhost:3000/users/me/logout
app.delete('/users/me/logout', authenticate, async (request, response) => {

    try {
        await request.user_Obj.removeToken(request.token_Val);
        response.status(200).send({
            message: 'Logged out successfully',
            isEveryThingOk: true
        })
    }
    catch (err) {
        response.status(400).send({
            message: 'logout failed',
            isEveryThingOk: false
        });
    }
});


app.listen(port, () => {
    console.log(`Running @${port} port`);
});


module.exports = {
    app
}

