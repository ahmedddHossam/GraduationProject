const jwt = require('jsonwebtoken');
const verifyToken = (req,res,next)=>{
    const authHeader = req.headers['Authorization'] || req.headers['authorization']
    console.log(req.headers);
    if(!authHeader){
        return res.status(401).json({
            message:'Login required'
        });
    }
    const token = authHeader.split(' ')[1];
    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY);
    next();
    }catch(err){
        return res.status(401).json({
            message:'Invalid Token'
        });
    }
}   

module.exports = verifyToken;