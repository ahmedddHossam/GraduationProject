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
    const hashedPassword = await bcrypt.hash(password,8);
    const newUser= await new db.user({
        UserName:UserName,
        Email:email,
        Password : hashedPassword,
        role : role
    });
    await newUser.save();
    return newUser;
}


const signUp = asyncWrapper(async (req,res,next)=>{
    const {UserName,email,password,role} = req.body;

    const emailChecker = await db.user.findOne({where:{Email:email }});

    if(emailChecker)
    {
        res.status(400).json({status:httpStatus.FAIL,message:'email already exist'})
    }
    try {
        const newUser = await addUser(UserName, email, password, role);
        console.log(newUser)
        if (role !== 'Graduate') {
            await addAdmin(newUser.UserId,role)
        }
        return res.status(200).json({status: httpStatus.SUCCESS, message: "Signed up successfully"});

    }
    catch (err){
        console.error(err);
        const error = appError.create('Internal server error on add new announcement ', 500, httpStatus.FAIL);
        return next(error)    }}
    );

const logIn = asyncWrapper(async (req,res,next)=>{
    const {email, password}=req.body;
    // console.log(email , password);
    if(!email)
    {
        res.status(400).json({message:'email is required',status:httpStatus.FAIL})

    }
    if(!password)
    {
        res.status(400).json({message:'password is required',status:httpStatus.FAIL})
    }
    // console.log('1')
    const user = await db.user.findOne({where:{Email:email }});
    // console.log(user)

    if(!user)
    {
        res.status(404).json({message:'wrong Email or password',status:httpStatus.FAIL})
    }
    const isMatched = await bcrypt.compare(password,user.Password)

    if(!isMatched)
    {
        res.status(404).json({message:'wrong Email or password',status:httpStatus.FAIL})

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
