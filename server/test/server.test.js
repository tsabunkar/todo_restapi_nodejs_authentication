const request = require('supertest')
var chai = require('chai');
const {
    ObjectID
} = require('mongodb')
const {
    app
} = require('./../server')
const {
    Todo
} = require('./../model/Todo')

var assert = chai.assert; // Using Assert style (Assest Test FrameWork)
var expectjs = chai.expect; // Using Expect style (Expect Test FrameWork)
var should = chai.should(); // Using Should style (Should Test FrameWork)

const todosArray = [{
        _id: new ObjectID(),
        text: 'First textValue'
    },
    {
        _id: new ObjectID(),
        text: 'Second textValue',
        completed: true,
        completedAt: 420
    }
];


//before running our test cases, we need to clean up the DB's records and insert todosArray, which is done below
//This beforeEach would be ran BEFORE each Test cases (i.e- BEFORE each it() method in specific)
//each time it() is executed before that beforEach() wuld be executed.
beforeEach((done) => {//this fun is provided by mocha
    Todo.remove({}) //It will remove all the documents from Todo collection
        .then(() => {
            Todo.insertMany(todosArray) //insert the Above array which has list of Object/Todo document
            done();
        });
})


describe('POST /todos_test', () => {

    it('should create a new todo object/document', (done) => {
        let testTodoObj = {
            text: 'Gymming',
            completed: true,
            completedAt: 12
        }

        request(app).post('/todos_test') //Testing Response payload
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
        request(app).post('/todos_test') //Testing Response payload
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


describe('GETALL /todos_test', () => {

    it('should get all the todos document', (done) => {
        request(app).get('/todos_test')
            .expect(200)
            .expect((resp) => {
                // console.log(resp.body);
                expectjs(resp.body.mytodo.length).to.be.equal(2);
                expectjs(resp.body.isEverythingOk).to.be.equal(true);
                expectjs(resp.body.mytodo[0].text).to.be.equal(todosArray[0].text);
                expectjs(resp.body.mytodo[1].text).to.be.equal(todosArray[1].text);
            })
            .end(done)
    })

});


describe('GETONE  /todos_test/:todoId', () => {


    it('should get particular todos document', (done) => {
        let objectIdInObjectType = todosArray[0]._id;
        let objectIdInStringType = objectIdInObjectType.toHexString();

        request(app).get(`/todos_test/${objectIdInStringType}`)
            .expect(200)
            .expect((resp) => {
                // console.log(resp.body);
                expectjs(resp.body.myTodoObj.text).to.be.equal(todosArray[0].text);
            })
            .end(done)
    })

    it('should return 404 if todo not found', (done) => {
        let objectIdVal = new ObjectID();
        request(app).get(`/todos_test/${objectIdVal.toHexString()}`)
            .expect(404)
            .end(done)
    })

    it('should return 404 if Object id is invalid', (done) => {
        request(app).get(`/todos_test/123abc}`)
            .expect(404)
            .end(done)
    })

});



describe('DELETE  /todos_test/:todoId', () => {

    it('should remove todos document', (done) => {
        let objectIdInObjectType = todosArray[1]._id;
        let objectIdInStringType = objectIdInObjectType.toHexString();

        request(app).delete(`/todos_test/${objectIdInStringType}`)
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
    it('should return 404 if todo not found', (done) => {
        let objectIdVal = new ObjectID();
        request(app).delete(`/todos_test/${objectIdVal.toHexString()}`)
            .expect(404)
            .end(done)
    })
    it('should return 404 if Object id is invalid', (done) => {
        request(app).delete(`/todos_test/123abc}`)
            .expect(404)
            .end(done)
    })

});


describe('PATCH  /todos_test/:todoId', () => {

    it('should update the todos docum', (done) => {
        let objectIdInObjectType = todosArray[1]._id;
        let objectIdInStringType = objectIdInObjectType.toHexString();

        let idToUpdate = todosArray[1]._id;

        testTodoObjUpdate = {
            text: 'Updating second Text!! :)',
            completed: true
        }
        request(app).patch(`/todos_test/${objectIdInStringType}`)
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

    it('Should clear completedAt when todo is not completed', (done) => {
        let objectIdInObjectType = todosArray[0]._id;
        let objectIdInStringType = objectIdInObjectType.toHexString();

        let idToUpdate = todosArray[0]._id;

        testTodoObjUpdate = {
            text: 'Updating First Text!! :(',
            completed: false
        }
        request(app).patch(`/todos_test/${objectIdInStringType}`)
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