//npm i crypto-js
const {SHA256} = require('crypto-js')

var message = "I am tejas";
var hash = SHA256(message);
console.log(typeof(hash));
console.log(hash);
console.log(hash.toString());
//hashing result(one way hashing);

//data we are sending back from server to client

var data  = {
    id : 4
} 

var token  = {
    data,
    hash : SHA256(JSON.stringify(data) + 'mySalt').toString() //hashing + 'mySalt' <- is salted
}

 token.data.id = 5; //hacker tries to change the data
// token.hash = SHA256(JSON.stringify(token.data)).toString();

var resultHash = SHA256(JSON.stringify(token.data)+'mySalt').toString();

if(token.hash === resultHash){
    console.log('data was not changed');
}else{
    console.log('data was  changed');
}

//the above method is called JWT (Json Web Token)

//We do have libraies for this JWT in npm like -> npm i jsonwebtoken --save