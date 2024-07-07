const db = require('../models');
const Graduate = db.graduate;
const { Sequelize, Op } = require("sequelize");
const httpStatusText = require('../utils/httpStatusText')

// Nominate TA API
const nominateTA = async (req, res) => {
    try {
        let dept = req.params.Department;

        // Calculate the date 2 years ago from today
        let twoYearsAgo = new Date();

        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

        console.log(twoYearsAgo)

        let graduates = await Graduate.findAll({
            where: {
                Department: dept,
                EndDate: {
                    [Sequelize.Op.gte]: twoYearsAgo
                }
            },
            order: [
                ['GPA', 'DESC']
            ],
            limit: 15
        });

        if(!graduates)
        {
            res.status(404).json({status:httpStatusText.SUCCESS,message:"There are no graduates according to the requirments"})
        }

        res.status(200).json({"status":httpStatusText.SUCCESS,
            "data": {"graduate": graduates}
        })
    } catch (error) {
        res.status(500).json({ message: 'An error occurred', error: error.message });
    }
}

module.exports = {
    nominateTA
}