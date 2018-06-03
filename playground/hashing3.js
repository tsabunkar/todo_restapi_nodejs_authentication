const bcrypt = require('bcryptjs');

var actualPassword = '123pass!';

//to hash the password 

//salt is builtin, we are not adding the salt, rather added by bcrypt algorithm
//soo for same password, every time we have different hashValue
//1st time -> 2a$10$NMRXDOGki8yNhlEIYnteReDQNL6Smlowo54k1IwA5fw2IzmXAsGpO
//2nd time -> $2a$10$IFSQLgLCMQ0k09A4MGk0dOiCWI.mmYaBzIZnLwAh6aUYb2LHw84.G

/* bcrypt.genSalt(10, (err,salt) => {
    bcrypt.hash(actualPassword,salt,(err, hashValue) =>{
        console.log(hashValue);
    })
}) */

//to verfiy the password
var hashedPassword = '$2a$10$IFSQLgLCMQ0k09A4MGk0dOiCWI.mmYaBzIZnLwAh6aUYb2LHw84.G';

bcrypt.compare(actualPassword,hashedPassword, (err,result) => {
    //result is boolean
    console.log(result);
} )