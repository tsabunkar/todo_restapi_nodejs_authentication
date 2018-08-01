const request = require('supertest')
var chai = require('chai');
const jwt = require('jsonwebtoken')
const {
    ObjectID
} = require('mongodb')

/* const {
    app
} = require('./../server') */

//Refering to server.js file which is implemented using async-await :)

const {
    app
} = require('./../server-async_await')


const {
    Todo
} = require('./../model/Todo')
const {
    User
} = require('./../model/User')

var assert = chai.assert; // Using Assert style (Assest Test FrameWork)
var expectjs = chai.expect; // Using Expect style (Expect Test FrameWork)
var should = chai.should(); // Using Should style (Should Test FrameWork)

let userOneId = new ObjectID();
let userTwoId = new ObjectID();
let access = 'auth';

const usersArray = [{
    _id: userOneId,
    email: 'tsabunkar@gmail.com',
    password: '123abc',
    tokens: [{
        access: 'auth',
        token: jwt.sign({
            _id: userOneId,
            access: access
        }, process.env.JWT_SECERT).toString()
    }]
},
{
    _id: userTwoId,
    email: 'ushasabunkar@gmail.com',
    password: '123abc',
    tokens: [{
        access: 'auth',
        token: jwt.sign({
            _id: userTwoId,
            access: access
        }, process.env.JWT_SECERT).toString()
    }]
}
]

const todosArray = [{
    _id: new ObjectID(),
    text: 'First textValue',
    _creator: userOneId
},
{
    _id: new ObjectID(),
    text: 'Second textValue',
    completed: true,
    completedAt: 420,
    _creator: userTwoId
}
];

//this before each shld be run first bcoz - First create the User document then add Todos document
beforeEach((done) => {
    User.remove({})
        .then(() => {
            var userOne = new User(usersArray[0]).save();
            var userTwo = new User(usersArray[1]).save();

            Promise.all([userOne, userTwo]).then((result) => {
                //promise.all -> ensures that untill UserOne and UserTwo callback is finsihed it will wait 
                //So, promise.all([callback1,callback2,....]) -> waits for all the callback argument to be finished(which passed as an array elem in the argum of all() func) then only execute further

                done();
            }).catch((err) => {
                done(err);
            });

        });
})

//before running our test cases, we need to clean up the DB's records and insert todosArray, which is done below
//This beforeEach would be ran BEFORE each Test cases (i.e- BEFORE each it() method in specific)
//each time it() is executed before that beforEach() wuld be executed.
beforeEach((done) => { //this fun is provided by mocha
    Todo.remove({}) //It will remove all the documents from Todo collection
        .then(() => {
            Todo.insertMany(todosArray) //insert the Above array which has list of Object/Todo document
            done();
        });
})


describe('POST /todos', () => {

    it('should create a new todo object/document', (done) => {
        let testTodoObj = {
            text: 'Gymming',
            completed: true,
            completedAt: 12
        }

        request(app).post('/todos') //Testing Response payload
            .set('x-auth', usersArray[0].tokens[0].token)
            .send(testTodoObj) //this request.body JS object will be converted to JSON by superTest
            .expect(200)
            .expect((resp) => {
                // console.log(resp.body);
                expectjs(resp.body).to.be.an('object');
                expectjs(resp.body).not.eql({}); //checking not empty array
                expectjs(resp.body.text).to.be.equal(testTodoObj.text)
            })
            // .end(done())
            .end((err, response) => { //Testing weather new record is inserted in the DB with proper value
                if (err) {
                    done(err); //passing the error to MOCHA's done callback method, so as to c in the screen
                    return
                }
                //GO to DB, only when document would have been inserted in the collection, now let us test that docum
                Todo.find({
                    text: testTodoObj.text,
                    completed: testTodoObj.completed,
                    completedAt: testTodoObj.completedAt
                })
                    .then((todoObj) => {
                        // console.log(todoObj);
                        expectjs(todoObj.length).to.be.equal(1); //checking the length of collec
                        expectjs(todoObj[0].text).to.be.equal(testTodoObj.text); //checking the text prop insert into db is same as passed 
                        done();
                    })
                    .catch((err) => {
                        done(err) //passing the error to MOCHA's done callback method, so as to c in the screen
                    });
            })
    })

    it('should not create todo with invalid data', (done) => {
        request(app).post('/todos') //Testing Response payload
            .set('x-auth', usersArray[0].tokens[0].token)
            .send({}) //this request.body JS object will be converted to JSON by superTest
            .expect(400)
            .expect((resp) => {
                expectjs(resp.body).to.be.an('object');
                expectjs(resp.body).not.eql({}); //checking not empty array
            })
            .end((err, response) => { //Testing weather new record is inserted in the DB with proper value
                if (err) {
                    done(err); //passing the error to MOCHA's done callback method, so as to c in the screen
                    return
                }

                Todo.find().then((todoObj) => {
                    expectjs(todoObj.length).to.be.equal(2);
                    done()
                }).catch((err) => {
                    done(err) //passing the error to MOCHA's done callback method, so as to c in the screen
                });
            })

    })

});


describe('GETALL /todos', () => {

    it('should get all the todos document', (done) => {
        // console.log(usersArray[0].tokens[0].token);
        request(app).get('/todos')
            .set('x-auth', usersArray[0].tokens[0].token)
            .expect(200)
            .expect((resp) => {
                // console.log(resp.body);
                expectjs(resp.body.mytodo.length).to.be.equal(1);
                expectjs(resp.body.isEverythingOk).to.be.equal(true);
                expectjs(resp.body.mytodo[0].text).to.be.equal(todosArray[0].text);
                // expectjs(resp.body.mytodo[1].text).to.be.equal(todosArray[1].text);
            })
            .end(done)
    })

});


describe('GETONE  /todos/:todoId', () => {


    it('should get particular todos document', (done) => {
        let objectIdInObjectType = todosArray[0]._id;
        let objectIdInStringType = objectIdInObjectType.toHexString();

        request(app).get(`/todos/${objectIdInStringType}`)
            .set('x-auth', usersArray[0].tokens[0].token)
            .expect(200)
            .expect((resp) => {
                // console.log(resp.body);
                expectjs(resp.body.myTodoObj.text).to.be.equal(todosArray[0].text);
            })
            .end(done)
    })

    it('should not return todo docum which was created by other user', (done) => {
        let objectIdInObjectType = todosArray[1]._id;
        let objectIdInStringType = objectIdInObjectType.toHexString();

        request(app).get(`/todos/${objectIdInStringType}`)
            .set('x-auth', usersArray[0].tokens[0].token)
            .expect(404)
            .end(done)
    })

    it('should return 404 if todo not found', (done) => {
        let objectIdVal = new ObjectID();
        request(app).get(`/todos/${objectIdVal.toHexString()}`)
            .set('x-auth', usersArray[0].tokens[0].token)
            .expect(404)
            .end(done)
    })

    it('should return 404 if Object id is invalid', (done) => {
        request(app).get(`/todos/123abc}`)
            .set('x-auth', usersArray[0].tokens[0].token)
            .expect(404)
            .end(done)
    })

});



describe('DELETE  /todos/:todoId', () => {

    it('should remove todos document', (done) => {
        let objectIdInObjectType = todosArray[1]._id;
        let objectIdInStringType = objectIdInObjectType.toHexString();

        request(app).delete(`/todos/${objectIdInStringType}`)
            .set('x-auth', usersArray[1].tokens[0].token)
            .expect(200)
            .expect((resp) => {
                // console.log(resp.body);
                expectjs(resp.body.myTodoObj.text).to.be.equal(todosArray[1].text);
            })
            .end((err, response) => {
                if (err) {
                    done(err)
                    return;
                }
                //query DB by findById (Searching for the Object which was already deleted)
                Todo.findById(objectIdInObjectType).then((todoDoc) => {
                    expectjs(todoDoc).is.null; //findById() -> return null (i.e- no document exist, bcoz that docum is already got deleted)
                    done();
                }).catch((err) => {
                    done(err);
                });
            })
    })

    it('should NOT remove todos document which  was created by others', (done) => {
        let objectIdInObjectType = todosArray[0]._id;
        let objectIdInStringType = objectIdInObjectType.toHexString();

        request(app).delete(`/todos/${objectIdInStringType}`)
            .set('x-auth', usersArray[1].tokens[0].token)
            .expect(404)
            .end((err, response) => {
                if (err) {
                    done(err)
                    return;
                }
                //query DB by findById (Searching for the Object which was already deleted)
                Todo.findById(objectIdInObjectType).then((todoDoc) => {
                    // console.log(todoDoc);
                    expectjs(todoDoc).is.exist;
                    done();
                }).catch((err) => {
                    done(err);
                });
            })
    })

    it('should return 404 if todo not found', (done) => {
        let objectIdVal = new ObjectID();
        request(app).delete(`/todos/${objectIdVal.toHexString()}`)
            .set('x-auth', usersArray[0].tokens[0].token)
            .expect(404)
            .end(done)
    })
    it('should return 404 if Object id is invalid', (done) => {
        request(app).delete(`/todos/123abc}`)
            .set('x-auth', usersArray[0].tokens[0].token)
            .expect(404)
            .end(done)
    })

});


describe('PATCH  /todos/:todoId', () => {

    it('should update the todos docum', (done) => {
        let objectIdInObjectType = todosArray[1]._id;
        let objectIdInStringType = objectIdInObjectType.toHexString();

        testTodoObjUpdate = {
            text: 'Updating second Text!! :)',
            completed: true
        }
        request(app).patch(`/todos/${objectIdInStringType}`)
            .set('x-auth', usersArray[1].tokens[0].token)
            .send(testTodoObjUpdate)
            .expect(200)
            .expect((resp) => {
                // console.log(resp.body);
                expectjs(resp.body.myTodoObj.text).to.be.equal(testTodoObjUpdate.text)
                expectjs(resp.body.myTodoObj.completed).to.be.equal(testTodoObjUpdate.completed)
                expectjs(resp.body.myTodoObj.completedAt).to.be.an('number');
                expectjs(resp.body.myTodoObj.completed).to.be.an('boolean');

            })
            .end(done)

    })

    it('should not able to update the todos docum created by other user', (done) => {
        let objectIdInObjectType = todosArray[0]._id;//first user
        let objectIdInStringType = objectIdInObjectType.toHexString();


        testTodoObjUpdate = {
            text: 'Updating second Text!! :)',
            completed: true
        }
        request(app).patch(`/todos/${objectIdInStringType}`)
            .set('x-auth', usersArray[1].tokens[0].token)
            .send(testTodoObjUpdate)
            .expect(404)
            .end(done)

    })

    it('Should clear completedAt when todo is not completed', (done) => {
        let objectIdInObjectType = todosArray[0]._id;
        let objectIdInStringType = objectIdInObjectType.toHexString();

        testTodoObjUpdate = {
            text: 'Updating First Text!! :(',
            completed: false
        }
        request(app).patch(`/todos/${objectIdInStringType}`)
            .set('x-auth', usersArray[0].tokens[0].token)
            .send(testTodoObjUpdate)
            .expect(200)
            .expect((resp) => {
                // console.log(resp.body);
                expectjs(resp.body.myTodoObj.text).to.be.equal(testTodoObjUpdate.text)
                expectjs(resp.body.myTodoObj.completed).to.be.equal(testTodoObjUpdate.completed)
                expectjs(resp.body.myTodoObj.completed).to.be.an('boolean');
                expectjs(resp.body.myTodoObj.completedAt).is.null;

            })
            .end(done)
    })
});



describe('GET /users/me', () => {

    it('should return user if authroized', (done) => {
        request(app).get('/users/me')
            .set('x-auth', usersArray[0].tokens[0].token)
            .expect(200)
            .expect((resp) => {
                expectjs(resp.body._id).to.be.equal(usersArray[0]._id.toHexString());
                expectjs(resp.body.email).to.be.equal(usersArray[0].email);
            })
            .end(done);
    })

    it('should return 401 if not authroized', (done) => {
        request(app).get('/users/me')
            .expect(401)
            .expect((resp) => {
                expectjs(resp.body).eql({})
            })
            .end(done);
    })
})


describe('POST /users/signup', () => {

    it('should create a user', (done) => {
        let emailToTest = 'shailesh@gmail.com';
        let passwordToTest = '123abc!';

        request(app)
            .post('/users/signup')
            .send({
                email: emailToTest,
                password: passwordToTest
            })
            .expect(200)
            .expect((resp) => {
                // console.log(resp.headers['x-auth']);
                expectjs(resp.headers['x-auth']).is.exist;
                expectjs(resp.body._id).is.exist;
                expectjs(resp.body.email).to.be.equal(emailToTest)

            })
            .end((err, response) => {

                if (err) {
                    done(err)
                    return
                }

                User.findOne({
                    email: emailToTest
                }).then((userDocum) => {
                    expectjs(userDocum).is.exist;
                    expectjs(userDocum.password).to.not.be.equal(passwordToTest)
                    done();

                }).catch((err) => {
                    done(err)
                });
            });
    })

    it('should return validation errors if request is invalid(invalid Email Addr)', (done) => {
        let emailToTest = 'shailesh#gmail.com';
        let passwordToTest = '123abc!';

        request(app)
            .post('/users/signup')
            .send({
                email: emailToTest,
                password: passwordToTest
            })
            .expect(400)
            .end(done)
    })

    it('should not create user if email is in use(ie-already created)', (done) => {

        let emailToTest = 'tsabunkar@gmail.com'; //This email is already created in the DB so we will get duplicate error(which means 400 err status)
        let passwordToTest = '123abc!';

        request(app)
            .post('/users/signup')
            .send({
                email: emailToTest,
                password: passwordToTest
            })
            .expect(400)
            .end(done)

    })
})

describe('POST /users/login', () => {

    it('should login user and return auth token', (done) => {
        request(app).post('/users/login')
            .send({
                email: usersArray[1].email,
                password: usersArray[1].password
            })
            .expect(200)
            .expect((resp) => {
                // console.log(resp.headers['x-auth']);
                // console.log(resp.body);
                expectjs(resp.headers['x-auth']).is.exist;
            })
            .end((err, response) => {
                if (err) {
                    done(err)
                    return
                }
                User.findById(usersArray[1]._id).then((userDocum) => {
                    // console.log(userDocum);
                    // console.log(userDocum.tokens[0].token === response.headers['x-auth']);
                    expectjs(userDocum.tokens[1]).to.include({
                        access: 'auth',
                        token: response.headers['x-auth']
                    })
                    done();
                }).catch((err) => {
                    done(err)
                });
            })
    })

    it('should reject invalid login (invalid username or password)', (done) => {
        request(app).post('/users/login')
            .send({
                email: usersArray[1].email,
                password: 'jqhefjh'
            })
            .expect(400)
            .expect((resp) => {
                expectjs(resp.headers['x-auth']).is.not.exist;
            })
            .end((err, response) => {
                if (err) {
                    done(err)
                    return
                }
                User.findById(usersArray[1]._id).then((userDocum) => {
                    expectjs(userDocum.tokens).to.have.length(1);

                    done();
                }).catch((err) => {
                    done(err)
                });
            })
    })

});



describe('DELETE /users/me/logout', () => {

    it('should remove the token value on logout', (done) => {
        request(app).delete('/users/me/logout')
            .set('x-auth', usersArray[0].tokens[0].token)
            .expect(200)
            .end((err, response) => {
                if (err) {
                    done(err);
                    return;
                }
                User.findById(usersArray[0]._id).then((userDocum) => {
                    expectjs(userDocum.tokens).to.have.length(0);

                    done();
                }).catch((err) => {
                    done(err)
                });

            })
    })
})