const { where } = require('sequelize');
const db = require('../models');
const Course = db.course;
const httpStatusText = require('../utils/httpStatusText');
const Graduate = db.graduate;

// add course 
const addCourse = async (req, res) => {
    try {
        const value = req.body
        let newCourse = await Course.create(value)

        res.json({
            "status": httpStatusText.SUCCESS,
            "data": { "course": newCourse }
        })

    }
    catch (error) {
        console.error('Error adding course:', error);
        res.status(500).send('Internal server error');

    }
}


// getAllCourses
const getCourses = async (req, res) => {
    try {

        const id = req.params.GraduateId 
        const year = id.slice(0,4)

        let courses 
        if (year <= 2008 ) {
            courses = await Course.findAll({
                where: {
                    bylaw: "old"
                }
            })
        }
        else {
            courses = await Course.findAll({
                where: {
                    bylaw: "new"
                }
            })
        }

        res.json({
            "status": httpStatusText.SUCCESS,
            "data": { "Courses": courses }
            })
    }
    catch {
        console.error('Error getting courses:', error);
        res.status(500).send('Internal server error');
    }
}

module.exports = {
    addCourse,
    getCourses
}