var {User} = require('./../model/User');

//creating the middle-ware
var authenticate = (req,resp,next) => {
    var tokenRxed = req.header('x-auth'); //It is used to fetch the header value

    //findByToken() -> userdefine fun used to find the appropriate user by taking the 
                             //token value
 var promiseObj = User.findByToken(tokenRxed);
 
 
 promiseObj.then((userObj) => {
        if(!userObj){
        return Promise.reject(); //It will reject the promise and pointer goes to catch block
        }

        req.user_Obj = userObj;
        req.token_Val = tokenRxed;
        //assigning the userObj value to user variable
        //assigning the tokenRxed to token variable
        next();
    }).catch((err) => {
        resp.status(401).send('Invalid token value')
    });    
}//end of middle-ware

module.exports = {
    authenticate
}