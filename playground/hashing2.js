const jwt = require('jsonwebtoken');

var data = {
    id : 4
}

var token = jwt.sign(data, 'mySalt');
console.log(token);

var decoded = jwt.verify(token, 'mySalt');
console.log(decoded);