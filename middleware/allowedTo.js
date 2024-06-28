const appError = require("../utils/appError");
const httpStatus = require("../utils/httpStatusText");
module.exports =(roles=[])=>{
    if (typeof roles === 'string') {
        roles = [roles];
    }
    console.log(typeof roles,"-----------------------",roles)
    return (req,res,next)=>{

        // console.log(req.currentUser.role)
        if(!roles.includes(req.currentUser.role))
        {
            const error = appError.create('Not authorized', 401, httpStatus.FAIL);
            return next(error);
        }
        next();
    }
}