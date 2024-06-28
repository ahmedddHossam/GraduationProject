const validator =require('validator');
const appError = require('../utils/appError');
const httpStatusText=require('../utils/httpStatusText');

module.exports= (req,res,next)=> {
    const {UserName, email, password, role} = req.body;

    // console.log(req.body,fName,lName,birthday,email,password);

    if (!(validator.isNumeric(UserName)))
    {
        const error= appError.create('User name must be numeric',401,httpStatusText.ERROR);
        return next(error);
    }
    if(!validator.isEmail(email))
    {
        const error= appError.create('Invalid Email',401,httpStatusText.ERROR);
        return next(error);
    }
    if(password.length<8)
    {
        const error= appError.create('Weak password',401,httpStatusText.ERROR);
        return next(error);
    }
    if(validator.isAlpha(password) || validator.isNumeric(password)){
        const error= appError.create('Password must contains both numbers and alphabetic',401,httpStatusText.ERROR);
        return next(error);
    }
    next();
}