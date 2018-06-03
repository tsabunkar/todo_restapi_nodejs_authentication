const _ = require('lodash');

var Emp = {
    ename : 'Tejas',
    esalary : 20000,
    isManager : false
}

var emp1 = _.pick(Emp, ['ename']);
console.log(emp1);

var emp2 = _.pick(Emp, ['ename', 'isManager']);
console.log(emp2);