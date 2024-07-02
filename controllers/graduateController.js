const db = require('../models');
const { Op, literal, DATE, where } = require('sequelize');
const Joi = require('joi');
const xlsx = require('xlsx');
const fs = require('fs');

const httpStatusText = require('../utils/httpStatusText');
const { log } = require('console');
// const Graduate = db.graduate;
// const Course = db.courses
// const enrolled = db.enrolled_in
// const { Graduate, Course, Enrolled_in } = db;

const Graduate = db.graduate;
const Request = db.request;
const { sendmail } = require('../utils/mailer');
const { timeStamp } = require('console');
const {addNewGraduate} = require('./authController');

const graduateSchema = Joi.object({
    GraduateId: Joi.number().required(),
    Name: Joi.string().required(),
    Email: Joi.string().email().required(),
    Gender: Joi.string().valid('Male', 'Female').required(),
    GPA: Joi.number().min(0).max(4).required(),
    Department: Joi.string().required(),
    NationalId: Joi.string().required(),
    Nationality: Joi.string().required(),
    StartDate: Joi.date().required(),
    EndDate: Joi.date().required(),
    MobileNumber: Joi.string().required(),
    Address: Joi.string().required(),
    Bylaw: Joi.string().required(),
    BylawVersion: Joi.string().required(),
    BirthDate: Joi.date().required()
});

// national id validation
function validateNationalID(nationalID, birthdate) {
    if (!(birthdate instanceof Date)) {
        birthdate = new Date(birthdate);
    }

    const century = nationalID.charAt(0) === '3' ? '20' : '19';
    // Check if the National ID is 14 digits long
    if (!/^\d{14}$/.test(nationalID)) {
        return false;
    }

    const year = century + nationalID.slice(1, 3);
    const month = nationalID.slice(3, 5);
    const day = nationalID.slice(5, 7);

    const extractedDate = new Date(`${year}-${month}-${day}`);
    console.log(extractedDate.toISOString().split('T')[0])
    console.log(birthdate.toISOString().split('T')[0])
    return extractedDate.toISOString().split('T')[0] === birthdate.toISOString().split('T')[0];
}


// add one graduate
const addGraduate = async (req, res) => {
    try {
        console.log(req.body);
        const { Graduate, Courses } = req.body;

        console.log(Graduate); 
        console.log(Courses);

        // Validate National ID and Birth Date
        if (!validateNationalID(Graduate.NationalId, Graduate.BirthDate)) {
            return res.status(400).send('National ID does not match the provided birthdate');
        }


        // Validate Mobile Number format
        if (!/^\d{11}$/.test(Graduate.MobileNumber)) {
            return res.status(400).send('Mobile number must be 11 digits');
        }

        let newGraduate = await db.graduate.create(Graduate);
        addNewGraduate(newGraduate.Email,newGraduate.NationalId,newGraduate.Name);
        let coursesList = [];

        // Enroll in courses
        if (Courses && Array.isArray(Courses)) {
            await Promise.all(Courses.map(async (course) => {
                try {
                    // Find the course by courseId
                    let enrolledCourse = await db.course.findByPk(course.courseId);
                    if (enrolledCourse) {
                        await db.enrolled_in.create({
                            GraduateId: newGraduate.GraduateId, 
                            courseId: course.courseId,
                            Grade: course.Grade, 
                            Term: course.Term, 
                            Year: course.Year,
                            Result: course.Result,
                            termWork: course.termWork, 
                            examWork: course.examWork,
                            Level: course.Level,
                            creditHours: course.creditHours
                        });
                    }
                    coursesList.push(enrolledCourse)
                } catch (error) {
                    console.error('Error enrolling in course:', error);
                }
            }));
        }

        res.status(200).json({
            "status": "success",
            "data": { "graduate": newGraduate ,
                "Courses": coursesList
            }
        });
        
        
    } catch (error) {
        console.error('Error adding graduate:', error);
        res.status(500).send('Internal server error');
    }
};





// add excel file of graduates
const addGraduatesFromFile = async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).send('No file uploaded');
        }

        if (!Graduate) {
            return res.status(500).send('Graduate model not found');
        }

        const workbook = xlsx.readFile(file.path);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        let rows = xlsx.utils.sheet_to_json(sheet);


        rows = rows.map(row => ({
            GraduateId: parseInt(row.GraduateId),
            Name: row.Name,
            Email: row.Email,
            Gender: row.Gender,
            GPA: parseFloat(row.GPA),
            Department: row.Department,
            NationalId: row.NationalId.toString(),
            Nationality: row.Nationality,
            StartDate: new Date(row.StartDate),
            EndDate: new Date(row.EndDate),
            MobileNumber: row.MobileNumber.toString(),
            Address: row.Address,
            Bylaw: row.Bylaw,
            BylawVersion: row.BylawVersion.toString(),
            BirthDate: new Date(row.BirthDate)
        }));

        // Validate and prepare data
        const graduates = [];
        for (const row of rows) {
            const { error, value } = graduateSchema.validate(row);
            if (error) {
                console.error(`Validation error for row: ${JSON.stringify(row)} - ${error.details[0].message}`);
                continue;
            }
            graduates.push(value);
        }

        if (graduates.length === 0) {
            return res.status(400).send('No valid graduate data found in the file');
        }

        const newGraduates = await Graduate.bulkCreate(graduates);
        res.json({
            "status": httpStatusText.SUCCESS,
            "data": { "graduate": newGraduates }
        })

        fs.unlinkSync(file.path);
    } catch (error) {
        console.error('Error adding graduates from file:', error);
        res.status(500).send('Internal server error');
    }
};

// search for graduate by id
const getOneGraduate = async (req, res) => {
    try {
        let id = req.params.GraduateId;
        let allCourses = await db.graduate.findByPk(id,
        //     {
        //     include: [{
        //         model: db.course,
        //         attributes: ['courseName', 'courseId', 'year', 'grade'],
        //         through: {
        //             attributes: ['creditHours', 'Term', 'Level', 'Result'],
        //         }
        //     }]
        // }
        );

        if (!allCourses) {
            return res.status(404).json({
                "status": "failure",
                "message": "Graduate not found"
            });
        }

        res.json({
            "status": "success",
            "data": { "graduate": allCourses }
        });
    } catch (error) {
        console.error('Error getting graduate:', error.message);
        console.error(error.stack);
        res.status(500).send('Internal server error');
    }
};


// get graduates of a specific year of a specific department
const getAllGraduatesOfDepartment = async (req, res) => {
    try {
        let dept = req.params.Department;
        let year = parseInt(req.params.Year);

        // Extract and filter by year of EndDate using raw SQL
        let graduates = await db.graduate.findAll({
            where: {
                Department: dept,
                [Op.and]: literal(`YEAR(EndDate) = ${year}`)
            }
        });

        res.json({
            "status": httpStatusText.SUCCESS,
            "data": { "graduate": graduates }
        })
    } catch (error) {
        console.error('Error getting graduates:', error);
        res.status(500).send('Internal server error');
    }
};


// get all graduates
const getAllGraduates = async (req, res) => {
    try {
        let graduates = await Graduate.findAll();
        res.json({
            "status": httpStatusText.SUCCESS,
            "data": { "graduate": graduates }
        })
    } catch (error) {
        console.error('Error getting graduates:', error);
        res.status(500).send('Internal server error');
    }
}

// update existing graduate
const updateGraduate = async (req, res) => {
    try {
        let id = req.params.GraduateId;

        const graduate = await Graduate.findOne({ where: { GraduateId: id } });
        if (!graduate) {
            return res.status(404).send('Graduate not found');
        }

        await graduate.update(req.body);

        res.json({
            "status": httpStatusText.SUCCESS,
            "data": { "graduate": graduate }
        })
    } catch (error) {
        res.status(500).send('Internal server error');
    }
}

// delete graduate
const deleteGraduate = async (req, res) => {
    try {
        let id = req.params.GraduateId;

        const graduate = await Graduate.findOne({ where: { GraduateId: id } });
        if (!graduate) {
            return res.status(404).send('Graduate not found');
        }

        await graduate.destroy({ where: { GraduateId: id } });

        res.json({
            "status": httpStatusText.SUCCESS,
            "text": "graduate deleted successfully"
        })

    } catch (error) {
        console.error('Error deleting graduate:', error);
        res.status(500).send('Internal server error');
    }
}


module.exports = {
    addGraduate,
    getOneGraduate,
    getAllGraduates,
    updateGraduate,
    deleteGraduate,
    addGraduatesFromFile,
    getAllGraduatesOfDepartment
}
