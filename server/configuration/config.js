//configuring to deploy on to heroku
//checking env is in develop, test, deployment

var env = process.env.NODE_ENV || 'development';
//NODE_ENV -> it is for production env
console.log('env ******', env);

if (env === 'development' || env === 'test') {//This code will never run in the production 
//envrio bcoz this If condition will never be passed as there is no env==='production'

//if envrio is develop or test
//then load this json file
//This config.json file will not be the pushed to github 
    //note: when we require the json file, it will be automatically be parsed to JS object 
    var config = require('./config.json')
    //this absolute path of config.json shld be inside this if statem only bcoz
    //in production (to heroku) this if condition will fail soo this line of code
    //will never be executed, bcoz will pushing to git & heroku wer ignoring this
    //config.json file soo , if used this file path our appl break in production

    //We are using this config.json to secure our development, test and DB enviro hidden from hacker and end client
    if(env === 'development'){
        process.env.PORT = config.development.PORT;
        process.env.MONGODB_URI = config.development.MONGODB_URI;
        process.env.JWT_SECERT = config.development.JWT_SECERT;
    }else{
        process.env.PORT = config.test.PORT;
        process.env.MONGODB_URI = config.test.MONGODB_URI;
        process.env.JWT_SECERT = config.test.JWT_SECERT;
    }
    
    /* console.log(process.env.PORT);
    console.log(process.env.MONGODB_URI);
    console.log(process.env.JWT_SECERT); */
    
    // console.log(config.development.JWT_SECERT);

    

}

/* 
if(env === 'development'){
    process.env.PORT = 3000; //if it is develop enviro then run the server @3000 port
    process.env.MONGODB_URI = 'mongodb://localhost:27017/mymongodb'
    //also mongodb db name -> mymongodb, in develop envir
}else if(env === 'test'){
    process.env.PORT = 3000;//if it is test enviro then run the server @3000 port
    process.env.MONGODB_URI = 'mongodb://localhost:27017/mymongodbtest'
        //also mongodb db name -> mymongodbtest, in test envir
} 
*/