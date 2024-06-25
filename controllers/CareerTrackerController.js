const asyncWrapper = require('../middleware/asyncWrapper');
const db = require('../models')
const appError = require('../utils/appError');
const httpStatus = require('../utils/httpStatusText');
const bcrypt=require('bcryptjs');
const TokenManipulation = require('../utils/TokenManipulation');
const {getDecoded} = require("../utils/TokenManipulation");
const {where} = require("sequelize");

const addSkills = asyncWrapper(async (req,res,next)=>{
    const skills = req.body.skills;
    const userEmail = req.currentUser.email;


    const graduate = await db.graduate.findOne({ where: { Email: userEmail } });

    try {
        for (const skillName of skills) {
            console.log(skillName)
            let [skill] = await db.skill.findOrCreate({
                where: {name: skillName}
            });
            // console.log(1)

            // console.log(skill.skillId,graduate.GraduateId)

            // Check if association already exists to avoid duplicates
            const existingAssociation = await db.graduateSkill.findOne({
                where: {
                    graduateId: graduate.GraduateId,
                    skillId: skill.skillId
                }
            });
            // console.log(existingAssociation)
            if(!existingAssociation)
            {
                let newSkill = await  db.graduateSkill.create({
                    graduateId : graduate.GraduateId,
                    skillId : skill.skillId
                });
            }
        }
        return res.status(200).json({status:httpStatus.SUCCESS,message : "added successfully "});
    }
    catch (err)
    {
        const error = appError.create('Failed to update skills',500,httpStatus.ERROR);
        return next(error);
    }
});

const getSkills = asyncWrapper(async (req,res,next)=>{

    const graduateId = req.params.graduateId;

    console.log(graduateId)
    if(!graduateId)
    {
        const error = appError.create('graduate id is required',400,httpStatus.FAIL);
        return next(error);
    }

    try{
       let allSkills = await db.graduate.findByPk(graduateId,{
           include: {
               model: db.skill,
               attributes: ['name'],
               through: {
                   attributes: []
               }
           }});

            return res.status(200).json({status:httpStatus.SUCCESS,data: { GraduateId : allSkills.GraduateId, Name:
                    allSkills.Name,
                    skills: allSkills.skills.map(skill => skill.name)}});
    }
    catch (err)
    {
        console.log(err)
        const error = appError.create('Failed to retrieve skills' ,500,httpStatus.FAIL);
        return next(error);
    }
})

module.exports = {addSkills,getSkills}