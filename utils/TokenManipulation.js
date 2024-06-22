
const jwt=require('jsonwebtoken');
const appError = require("./appError");
const httpStatus = require("./httpStatusText");

const generate =async (payload)=>{
    console.log(payload)
    return jwt.sign(payload, process.env.JWT_SECRET_KEY, {expiresIn: '120m'});
}

const destroy = async (payload)=>{
    return jwt.sign(payload, process.env.JWT_SECRET_KEY, {expiresIn: '0m'});
}


const verifyToken =(req,res,next)=>{
    const header = req.headers['Authorization'] || req.headers['authorization'];
    if(!header){
        const error = appError.create('Token is required', 401, httpStatus.ERROR);
        return next(error);
    }
    const token= header.split(' ')[1];
    try
    {
        const user = jwt.verify(token, process.env.JWT_SECRET_KEY);
        console.log(user)
        req.currentUser = user;
        next();
    }
    catch (err)
    {
        const error = appError.create('Invalid Token', 401, httpStatus.ERROR);
        return next(error);
    }
}

module.exports={
    generate,destroy,verifyToken
}
