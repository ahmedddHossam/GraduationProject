const asyncWrapper = require('../middleware/asyncWrapper');
const db = require('../models')
const appError = require('../utils/appError');
const httpStatus = require('../utils/httpStatusText');
const bcrypt=require('bcryptjs');
const TokenManipulation = require('../utils/TokenManipulation');
const {getDecoded} = require("../utils/TokenManipulation");
async function  addAdmin(userId) {
    const newAdmin = await new db.admin({
        userUserId:userId
    });
    console.log(newAdmin)
    await newAdmin.save();
}
async function  addNewGraduate(userEmail, password, userName)
{
    await addUser(userName,userEmail,password,"Graduate")
}

async function  addUser(UserName,email,password,role)
{
    // console.log("1")
    const hashedPassword = await bcrypt.hash(password,8);
    // console.log(fName)
    const newUser= await new db.user({
        UserName:UserName,
        Email:email,
        Password : hashedPassword,
        role : role
    });
    await newUser.save();
    return newUser;
    // console.log("2")
}


const signUp = asyncWrapper(async (req,res,next)=>{
    const {UserName,email,password,role} = req.body;
    // console.log(UserName, email, password, role);

    const emailChecker = await db.user.findOne({where:{Email:email }});

    if(emailChecker)
    {
        const error = appError.create('email already exist',400,httpStatus.FAIL);
        return next(error);
    }
    try {
        console.log('1')
        const newUser = await addUser(UserName, email, password, role);
        console.log(newUser)
        if (role === 'Admin') {
            await addAdmin(newUser.UserId)
        }
        // console.log('3')
        // else
        // {
        //
        // }}
        return res.status(200).json({status: httpStatus.SUCCESS, message: "Signed up successfully"});

    }catch (err){
        console.log(err)}
    }
);

const logIn = asyncWrapper(async (req,res,next)=>{
    const {email, password}=req.body;
    // console.log(email , password);
    if(!email)
    {
        const error = appError.create('email is required',400,httpStatus.FAIL);
        return next(error);
    }
    if(!password)
    {
        const error = appError.create('password is required',400,httpStatus.FAIL);
        return next(error);
    }
    // console.log('1')
    const user = await db.user.findOne({where:{Email:email }});
    // console.log(user)

    if(!user)
    {
        const error = appError.create('Wrong email',400,httpStatus.FAIL);
        return next(error);
    }
    const isMatched = await bcrypt.compare(password,user.Password)

    if(!isMatched)
    {
        const error = appError.create('Wrong password',400,httpStatus.FAIL);
        return next(error);
    }

    const token =await TokenManipulation.generate({email : user.Email , id:user.UserId, role : user.role});

    return res.status(200).json({status:httpStatus.SUCCESS,data: {token:token}});
});

const logOut =asyncWrapper(async (req,res,next)=>{

    const token = getDecoded(req);

    await TokenManipulation.destroy({email:token.email , id:token.id, role : token.role})

    return res.status(200).json({status:httpStatus.SUCCESS, message: "Logged out successfully"});

})

module.exports = {
    logIn,
    logOut,
    signUp,
    addNewGraduate
}
