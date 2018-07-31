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
        text: 'Second textValue'
    }
];


//before running our test cases, we need to clean up the DB's records, which is done below
beforeEach((done) => {
    Todo.remove({}) //It will remove all the documents from Todo collection
        .then(() => {
            Todo.insertMany(todosArray)
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
                 console.log(resp.body);
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

    it('should return 404 for non-Object ids', (done) => {
        request(app).get(`/todos_test/123abc}`)
            .expect(404)
            .end(done)
    })

});