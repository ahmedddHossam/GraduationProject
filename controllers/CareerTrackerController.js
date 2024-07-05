
const asyncWrapper = require('../middleware/asyncWrapper');
const db = require('../models')
const appError = require('../utils/appError');
const httpStatus = require('../utils/httpStatusText');
const bcrypt=require('bcryptjs');
const TokenManipulation = require('../utils/TokenManipulation');
const {getDecoded} = require("../utils/TokenManipulation");
const {where, DATEONLY} = require("sequelize");
const addSkills = asyncWrapper(async (req,res,next)=>{
    const skills = req.body.skills;
    const userEmail = req.currentUser.email;

    const graduate = await db.graduate.findOne({ where: { Email: userEmail } });

    try {
        for (const skillName of skills) {
            // console.log(skillName)
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

const getSkills = asyncWrapper(async (req, res, next) => {
    const graduateId = req.params.graduateId;

    if (!graduateId) {
        const error = appError.create('graduate id is required', 400, httpStatus.FAIL);
        return next(error);
    }

    try {
        let allSkills = await db.graduate.findByPk(graduateId, {
            include: {
                model: db.skill,
                attributes: ['name'],
                through: {
                    attributes: []
                }
            },

        });

        if (!allSkills) {
            const error = appError.create('Graduate not found', 404, httpStatus.FAIL);
            return next(error);
        }

        const formattedData = {
            GraduateId: allSkills.GraduateId,
            Name: allSkills.Name,
            skills: allSkills.skills.map(skill => skill.name)
        };

        return res.status(200).json({ status: httpStatus.SUCCESS, data: formattedData });
    } catch (err) {
        console.log(err);
        const error = appError.create('Failed to retrieve skills', 500, httpStatus.FAIL);
        return next(error);
    }
});



const updatePosition = asyncWrapper(async (req, res, next) => {
    const { company: company_name, position, startDate } = req.body;
    const userEmail = req.currentUser.email;

    try {
        const graduate = await db.graduate.findOne({ where: { Email: userEmail } });
        if (!graduate) {
            throw new Error('Graduate not found');
        }

        let [company] = await db.company.findOrCreate({
            where: { CompanyName: company_name }
        });

        const formattedStartDate = startDate;

        // Check if there is an existing association with the same graduate, company, and position
        let existingAssociation = await db.work_in.findOne({
            where: {
                graduateId: graduate.GraduateId,
                companyId: company.CompanyId,
                Position: position
            }
        });

        if (existingAssociation) {
            // If the same position already exists, we might update the end date if needed
            existingAssociation.endDate = new Date();
            await existingAssociation.save();
        } else {
            // Check if there is any other current position with the same graduate and end it
            let currentPosition = await db.work_in.findOne({
                where: {
                    graduateId: graduate.GraduateId,
                    companyId: company.CompanyId,
                    endDate: '9999-12-30'
                }
            });

            if (currentPosition) {
                currentPosition.endDate = new Date();
                await currentPosition.save();
            }

            // Create the new position
            await db.work_in.create({
                graduateId: graduate.GraduateId,
                companyId: company.CompanyId,
                Position: position,
                startDate: formattedStartDate,
                endDate: '9999-12-30'
            });
        }

        return res.status(200).json({ status: httpStatus.SUCCESS, message: "Updated successfully" });
    } catch (err) {
        console.error("Validation Error: ", err.errors || err.message); // Log detailed validation errors
        const error = appError.create(err.message, 500, httpStatus.ERROR);
        return next(error);
    }
});
const getPositions = asyncWrapper(async (req, res, next) => {
    const graduateId = req.params.graduateId;

    if (!graduateId) {
        const error = appError.create('graduate id is required', 400, httpStatus.FAIL);
        return next(error);
    }

    // Extract limit and offset from query parameters, with default values
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    try {
        let allPositions = await db.graduate.findByPk(graduateId, {
            include: {
                model: db.company,
                attributes: ['CompanyName'],
                through: {
                    attributes: ['Position', 'startDate', 'endDate']
                }
            },
        });

        if (!allPositions) {
            const error = appError.create('Graduate not found', 404, httpStatus.FAIL);
            return next(error);
        }

        const formattedData = {
            GraduateId: allPositions.GraduateId,
            Name: allPositions.Name,
            Companies: allPositions.companies.map(company => ({
                CompanyName: company.CompanyName,
                Position: company.work_in.Position,
                startDate: company.work_in.startDate,
                endDate: company.work_in.endDate
            }))
        };

        return res.status(200).json({ status: httpStatus.SUCCESS, data: formattedData });
    } catch (err) {
        console.log(err);
        const error = appError.create('Failed to retrieve positions', 500, httpStatus.FAIL);
        return next(error);
    }
});

module.exports = {addSkills,getSkills,updatePosition,getPositions}