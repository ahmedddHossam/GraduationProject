const db = require('../models');
const Graduate = db.graduate;
const Skills = db.skill;
const { Sequelize, Op } = require("sequelize");


const manageProfile = async(req,res,next)=>{
    let allSkills = {};
    if(req.currentUser.role==="Post Graduate Studies Admin" || req.currentUser.role=== "Graduate Affairs Admin" || req.currentUser.role=== "Super Admin"){
        const {id} = req.params;
        console.log(id);
        allSkills = await db.graduate.findByPk(id, {
            include:[ {
                model: db.skill,
                attributes: ['name'],
                through: {
                    attributes: []
                },required:false

            },
                {
                    model: db.company,
                    attributes: ['CompanyName'],
                    through: {
                        attributes: ['Position', 'startDate', 'endDate']
                    },
                    required:false
                }
            ]

        });
        console.log(allSkills)
    }else if(req.currentUser.role==='Graduate'){
        const grad = req.currentUser;
        console.log(grad.email);
        const email = grad.email
        const user = await Graduate.findOne({where:{
                Email: email
            }});

        allSkills = await db.graduate.findByPk(user.GraduateId, {
            include:[ {
                model: db.skill,
                attributes: ['name'],
                through: {
                    attributes: []
                },required:false

            },
                {
                    model: db.company,
                    attributes: ['CompanyName'],
                    through: {
                        attributes: ['Position', 'startDate', 'endDate']
                    },required:false
                }
            ]

        });
    }


    if(allSkills){
        res.status(200).send({status:'SUCCESS',data:allSkills});
    }else{
        res.status(404).json({error:"User Not Found"});
    }
}


module.exports = {
    manageProfile,

}