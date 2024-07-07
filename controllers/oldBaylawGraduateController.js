const db = require('../models');
const { Op, literal, DATE, where } = require('sequelize');
const Joi = require('joi');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const asyncWrapper = require('../middleware/asyncWrapper');
const appError = require('../utils/appError');
const httpStatus = require('../utils/httpStatusText');
const Graduate = db.oldBaylawGraduate;
const {addNewGraduate} = require('./authController');
const httpStatusText = require("../utils/httpStatusText");
const { Sequelize, DataTypes } = require('sequelize');

const graduateSchema = Joi.object({
    GraduateId: Joi.number().required(),
    Name: Joi.string().required(),
    Email: Joi.string().email().required(),
    Gender: Joi.string().valid('Male', 'Female').required(),
    NationalId: Joi.string().required(),
    Nationality: Joi.string().required(),
    StartDate: Joi.date().required(),
    EndDate: Joi.date().required(),
    MobileNumber: Joi.string().required(),
    Address: Joi.string().required(),
    Bylaw: Joi.string().required(),
    BylawVersion: Joi.string().required(),
    BirthDate: Joi.date().required(),
    Major:Joi.string().required(),
    Grade : Joi.string().required(),
    Minor: Joi.string().required()
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

async function calcFinalGrade (graduateId){

    // add filter to don't count failed course if he passed it
    const all_courses = await db.oldBaylaweEnrolledIn.findAll({where:{
            graduateId:graduateId,
        }})
    let sum = 0;
    let count = 0;
    for (const course of all_courses)
    {
        sum = sum +  course.Result ;
        count = 1 + count;
    }
    let graduate = await db.oldBaylawGraduate.findByPk(graduateId);
    graduate.total_mark = sum;
    console.log(sum)
    console.log(count)
    let final = (sum/count);

    console.log(final)
    if(final >= 85)
    {
        graduate.Grade = "A";
    }
    else if(final>=75)
    {
        graduate.Grade = "B"
    }
    else if(final>=65)
    {
        graduate.Grade = "C"
    }else if(final>=50)
    {
        graduate.Grade = "D"
    }else
    {
        graduate.Grade = "F"
    }

    await graduate.save();
}
// add one graduate
const addGraduate = async (req, res) => {
    try {
        console.log(req.body);
        const { Graduate, Courses } = req.body;

        // Validate National ID and Birth Date
        if (!validateNationalID(Graduate.NationalId, Graduate.BirthDate)) {
            return res.status(400).send('National ID does not match the provided birthdate');
        }


        // Validate Mobile Number format
        if (!/^\d{11}$/.test(Graduate.MobileNumber)) {
            return res.status(400).send('Mobile number must be 11 digits');
        }

        let newGraduate = await db.oldBaylawGraduate.create(Graduate);
        addNewGraduate(newGraduate.Email,newGraduate.NationalId,newGraduate.Name);

        let coursesList = [];
        // Enroll in courses
        if (Courses && Array.isArray(Courses)) {
            await Promise.all(Courses.map(async (course) => {
                try {
                    // Find the course by courseId
                    let enrolledCourse = await db.course.findByPk(course.courseId);
                    let result ;
                    const grade = course.Grade;
                    if(grade == "A")
                    {
                        result =  Math.floor(Math.random() * (100 - 85 + 1)) + 85;
                    }
                    else if(grade == "B")
                    {
                        result =  Math.floor(Math.random() * (84 - 75 + 1)) + 75;
                    }
                    else if(grade == "C")
                    {
                        result =  Math.floor(Math.random() * (74 - 65 + 1)) + 65;
                    }
                    else if(grade == "D")
                    {
                        result =  Math.floor(Math.random() * (64 - 50 + 1)) + 50;
                    }
                    else {
                        result =  Math.floor(Math.random() * (49 + 1))
                    }

                    if (enrolledCourse) {
                        await db.oldBaylaweEnrolledIn.create({
                            graduateId : newGraduate.GraduateId,
                            courseId : course.courseId,
                            Grade: course.Grade,
                            Term: course.Term,
                            Year: course.Year,
                            Result: result,
                            Level: course.Level,
                        });
                    }
                    coursesList.push(enrolledCourse)
                } catch (error) {
                    console.error('Error enrolling in course:', error);
                }
            }));
        }

        await calcFinalGrade(newGraduate.GraduateId);
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


// search for graduate by id
const getOneGraduate = async (req, res) => {
    try {
        let nationalid = req.params.NationalId;
        console.log(nationalid)
        let allCourses = await db.oldBaylawGraduate.findOne({
            where: { Nationalid: nationalid },
        });
        console.log(allCourses)

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




const addGraduateCourseFromFile = asyncWrapper(async (req, res,next) => {
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
        let uniqueIDs = new Set();


        for (const row of rows){
            const graduate_id = parseInt(row.stud_id);
            const graduate = await db.oldBaylawGraduate.findByPk(graduate_id);

            if(!graduate)
            {
                const error = appError.create('Wrong ID',404,httpStatus.FAIL);
                return next(error);
            }

            uniqueIDs.add(graduate_id)

            let result ;
            const grade = row.grade;
            if(grade == "A")
            {
                result =  Math.floor(Math.random() * (100 - 85 + 1)) + 85;
            }
            else if(grade == "B")
            {
                result =  Math.floor(Math.random() * (84 - 75 + 1)) + 75;
            }
            else if(grade == "C")
            {
                result =  Math.floor(Math.random() * (74 - 65 + 1)) + 65;
            }
            else if(grade == "D")
            {
                result =  Math.floor(Math.random() * (64 - 50 + 1)) + 50;
            }
            else {
                result =  Math.floor(Math.random() * (49 + 1))
            }

            const newCourse = await db.oldBaylaweEnrolledIn.create({
                courseId : row.subj_id,
                courseName: row.subj_name,
                Grade : grade,
                Result:result,
                Term:row.term,
                Year:row.year,
                Level:row.level,
                graduateId:row.stud_id,
            })


        }
         for (const ID of uniqueIDs) {
            await calcFinalGrade(ID)
        }
        fs.unlinkSync(file.path);
        return res.status(201).json({status: httpStatus.SUCCESS, message:"Added successfully"});

    } catch (error) {
        console.error('Error adding graduates from file:', error);
        res.status(500).send('Internal server error');
    }
});

const addGraduateFromFile = asyncWrapper(async (req,res,next)=>{
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
            NationalId: row.NationalId.toString(),
            Nationality: row.Nationality,
            StartDate: new Date(row.StartDate),
            EndDate: new Date(row.EndDate),
            MobileNumber: row.MobileNumber.toString(),
            Address: row.Address,
            Bylaw: row.Bylaw,
            BylawVersion: row.BylawVersion.toString(),
            BirthDate: new Date(row.BirthDate),
            Major : row.Major,
            Minor : row.Minor,
            Grade : row.Grade,
            arabicName : row.arabicName,
            projectGrade : row.projectGrade

        }));
        // Create a set to store GraduateIds

        // Validate and prepare data
        const graduates = [];
        for (const row of rows) {
            console.log(row)
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

        for (const graduate of graduates) {
            await addNewGraduate(graduate.Email,graduate.NationalId,graduate.Name);
        }
        fs.unlinkSync(file.path);

        res.json({
            "status": httpStatusText.SUCCESS,
            "data": { "graduate": newGraduates }
        })

    } catch (error) {
        console.error('Error adding graduates from file:', error);
        res.status(500).send('Internal server error');
    }

})

const updateGraduate = asyncWrapper(async (req, res,next) => {
    try {
        const graduateId = req.params.graduateId;
        const { Graduate, Courses } = req.body;
        // console.log(Courses)

        // Update graduate information
        const graduate = await db.graduate.findByPk(graduateId);

        if (!graduate) {
            const error = appError.create('Graduate not found', 404, httpStatus.FAIL);
            return next(error);
        }

        graduate.Email = Graduate.Email;
        graduate.MobileNumber = Graduate.MobileNumber;
        graduate.Address = Graduate.Address;

        await graduate.save(); // Save the updated graduate information

        // Update enrolled course information
        for ( const course of Courses ) {
            console.log(course)
            let Course = await db.oldBaylaweEnrolledIn.findOne({
                where: {
                    graduateId: graduateId ,
                    courseId: course.courseId
                }
            })
            Course.Year = course.year;
            Course.Term = course.enrolled_in.Term;
            Course.Level = course.enrolled_in.Level;
            Course.Result = course.enrolled_in.Result;
            await Course.save();
        }

        return res.status(200).json({ status: httpStatus.SUCCESS, message : "Updated" });

    } catch (error) {
        const err = appError.create('Internal server error', 500, httpStatus.FAIL);
        return next(err);
    }
});
module.exports={addGraduateCourseFromFile,addGraduateFromFile,addGraduate,updateGraduate,getOneGraduate};