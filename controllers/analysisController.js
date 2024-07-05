const db = require('../models/index');
const asyncWrapper = require("../middleware/asyncWrapper");
const {response} = require("express");
const httpStatusText = require("../utils/httpStatusText");
const {grad} = require("./print.controller");


const internationalCompanies = ['Google', 'Microsoft','Youtube','Apple','Samsung','Huawei','Intel','IBM']
const Analyze = asyncWrapper(async(req,res,next)=>{
    const allGraduates = await db.graduate.findAll( {
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

    let companyCount = {"International Companies": 0, "Local Companies": 0,"Unemployed":0};
    console.log(allGraduates)
    allGraduates.forEach(graduate => {
        if (graduate.companies.length === 0) {
            companyCount["Unemployed"]++;
        } else {
            let worksInInternationalCompany = false;

            if (internationalCompanies.includes(graduate.companies[graduate.companies.length-1].CompanyName)) {
                    worksInInternationalCompany = true;
                }

            if (worksInInternationalCompany) {
                companyCount["International Companies"]++;
            } else {
                companyCount["Local Companies"]++;
            }
        }
    });


    let mostFamous = {};

    allGraduates.forEach(graduate => {
        graduate.skills.forEach(skill => {
            if (mostFamous[skill.name]) {
                mostFamous[skill.name]++;
            } else {
                mostFamous[skill.name] = 1;
            }
        });
    });


    return res.json({"status":httpStatusText.SUCCESS,
        "data":{employeeAnalysis:companyCount,skillsAnalysis:mostFamous}
    });
})




module.exports = {
    Analyze
}