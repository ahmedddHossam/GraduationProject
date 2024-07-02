const db = require('../models');
const Graduate = db.graduate;
const Skills = db.skill;
const { Sequelize, Op } = require("sequelize");


const manageProfile = async(req,res,next)=>{
    const grad = req.currentUser;
    console.log(grad.email);
    const email = grad.email
    const user = await Graduate.findOne({where:{
        Email: email
        }});
    const allSkills = await db.graduate.findByPk(user.GraduateId, {
        include:[ {
            model: db.skill,
            attributes: ['name'],
            through: {
                attributes: []
            }

            },
            {
                model: db.company,
                attributes: ['CompanyName'],
                through: {
                    attributes: ['Position', 'startDate', 'endDate']
                }
            }
            ]

    });
    console.log(allSkills)
    if(allSkills){
        res.status(200).send({status:'SUCCESS',data:allSkills});
    }else{
        res.status(404).json({error:"User Not Found"});
    }
}

module.exports = {
    manageProfile,
}