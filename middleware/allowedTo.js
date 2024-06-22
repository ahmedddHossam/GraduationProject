const appError = require("../utils/appError");
const httpStatus = require("../utils/httpStatusText");
module.exports =(...roles)=>{

    return (req,res,next)=>{

        if(!roles.includes(req.currentUser.role))
        {
            const error = appError.create('Not authorized', 401, httpStatus.FAIL);
            return next(error);
        }
        next();
    }
}