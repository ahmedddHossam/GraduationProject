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
const asyncWrapper = require("../middleware/asyncWrapper");
const appError = require("../utils/appError");
const httpStatus = require("../utils/httpStatusText");

const graduateSchema = Joi.object({
    GraduateId: Joi.number().required(),
    Name: Joi.string().required(),
    Email: Joi.string().email().required(),
    Gender: Joi.string().valid('Male', 'Female').required(),
    GPA: Joi.number().min(0).max(4),
    NationalId: Joi.string().required(),
    Nationality: Joi.string().required(),
    StartDate: Joi.date().required(),
    EndDate: Joi.date().required(),
    MobileNumber: Joi.string().required(),
    Address: Joi.string().required(),
    Bylaw: Joi.string().required(),
    BylawVersion: Joi.string().required(),
    BirthDate: Joi.date().required(),
    arabicName:Joi.string().required(),
    projectGrade:Joi.string().required(),
    Minor: Joi.string(),
    Major: Joi.string().required(),
    Grade : Joi.string(),

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
    const all_courses = await db.enrolled_in.findAll({where:{
            graduateId:graduateId,
        }})
    let sum = 0;
    let count = 0;
    for (const course of all_courses)
    {
        sum = sum +  course.Result ;
        count = 1 + count;
    }
    let graduate = await db.graduate.findByPk(graduateId);
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
            console.log(Courses);
            await Promise.all(Courses.map(async (course) => {
                try {
                    // Find the course by courseId
                        let [enrolledCourse] = await db.course.findOrCreate({where:{courseName:course.courseName}});
                    if (enrolledCourse) {
                        await db.enrolled_in.create({
                            graduateId: newGraduate.GraduateId,
                            courseId: enrolledCourse.courseId,
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
        const bylaw = req.body.bylaw;
        if (!file) {
            return res.status(400).send('No file uploaded');
        }

        if (!Graduate) {
            return res.status(500).send('Graduate model not found');
        }

        const workbook = xlsx.readFile(file.path,{codepage:65001});
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        let rows = xlsx.utils.sheet_to_json(sheet);
        if(bylaw === "old" || bylaw === "Old"){
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
        }else if(bylaw === "new" || bylaw === "New"){
            rows = rows.map(row => ({
                GraduateId: parseInt(row.GraduateId),
                Name: row.Name,
                Email: row.Email,
                Gender: row.Gender,
                GPA: parseFloat(row.GPA),
                Major: row.Major,
                NationalId: row.NationalId.toString(),
                Nationality: row.Nationality,
                StartDate: new Date(row.StartDate),
                EndDate: new Date(row.EndDate),
                MobileNumber: row.MobileNumber.toString(),
                Address: row.Address,
                Bylaw: row.Bylaw,
                BylawVersion: row.BylawVersion.toString(),
                BirthDate: new Date(row.BirthDate),
                arabicName : row.arabicName,
                projectGrade : row.projectGrade
            }));

        }


        // Validate and prepare data
        let graduates = [];
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
};

// search for graduate by id
const getOneGraduate = async (req, res) => {
    try {
        let nationalid = req.params.NationalId;
        console.log(nationalid)
        const grad = await db.graduate.findOne({where:{NationalId:nationalid}});
        console.log(grad)
        if(!grad){
            return res.status(404).json('This Id is Invalid')
        }
        let allCourses = null;
        if(grad.Bylaw === "old" || grad.Bylaw==="Old"){
             allCourses = await db.graduate.findByPk(grad.GraduateId,{include:[

                         db.oldBaylaweEnrolledIn
                 ]
             })
        }else if(grad.Bylaw ==="new" || grad.Bylaw === "New"){
             allCourses = await db.graduate.findOne({
                where: { nationalid: nationalid },
                include: [{
                    model: db.course,
                    attributes: ['courseName', 'courseId'],
                    through: {
                        model:db.enrolled_in,
                        attributes: ['creditHours', 'Term','year', 'Level', 'Result'],
                    }
                }]
            });
        }

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


// get graduates of a specific year of a specific department
const getAllGraduatesOfDepartment = async (req, res) => {
    try {
        let dept = req.params.Department;
        let year = parseInt(req.params.Year);

        // Extract and filter by year of EndDate using raw SQL
        let graduates = await db.graduate.findAll({
            where: {
                Major: dept,
                [Op.and]: literal(`YEAR(StartDate) = ${year}`)
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
const addCourseToGraduate = async (req, res) => {
    try {
        const nationalId = req.params.NationalId;
        const { Courses } = req.body;

        let grad = await db.graduate.findOne({
            where: {
                NationalId: nationalId
            }
        });

        if (!Courses || !Array.isArray(Courses)) {
            return res.status(400).json({ status: 'fail', message: 'Courses is required and should be an array' });
        }
        console.log(Courses);

        const coursesList = [];

        await Promise.all(Courses.map(async (course) => {
            try {
                // Find the course by courseId
                const enrolledCourse = await db.course.findByPk(course.courseId);
                if (enrolledCourse) {
                    await db.enrolled_in.create({
                        GraduateId: grad.GraduateId,
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
                    coursesList.push({
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
                } else {
                    console.log(`Course with ID ${course.courseId} not found`);
                }
            } catch (error) {
                console.error(`Error enrolling in course with ID ${course.courseId}:`, error);
            }
        }));

        res.json({
            status: 'success',
            data: {
                graduate: nationalId,
                Courses: coursesList
            }
        });
    } catch (error) {
        console.error('Internal server error:', error);
        res.status(500).send('Internal server error');
    }
};





// delete graduate
const deleteCourse = async (req, res) => {
    try {
        let nationalid = req.params.NationalId;
        let courseId = req.params.courseId;

        let grad = await db.graduate.findOne({
            where: {
                NationalId: nationalid
            }
        })
        const bylaw = grad.Bylaw;
        console.log(nationalid)
        console.log(courseId)
        let result = null;
        if(bylaw === "new" || bylaw === "New"){
             result = await db.enrolled_in.destroy({
                where: {
                    GraduateId: grad.GraduateId,
                    CourseId: courseId
                }
            });
        }else if(bylaw === "old" || bylaw === "Old"){
             result = await db.oldBaylaweEnrolledIn.destroy({
                where: {
                    GraduateId: grad.GraduateId,
                    CourseId: courseId
                }
            });
        }


        if (result === 0) {
            return res.status(404).json({
                status: "fail",
                text: "No record found to delete"
            });
        }

        res.json({
            status: "success",
            text: "Record deleted successfully"
        });

    } catch (error) {
        console.error('Error deleting record:', error);
        res.status(500).json({
            status: "error",
            text: 'Internal server error',
            error: error.message
        });
    }
}


// update Graduate
const updateGraduate = async (req, res) => {
    try {
        const nationalId = req.params.NationalId;
        const { Graduate, Courses } = req.body;
        console.log(Courses)

        // Update graduate information
        let grad = await db.graduate.findOne({
            where: {
                NationalId: nationalId
            }
        })

        if (!grad) {
            return res.status(404).json({
                status: "fail",
                text: "Graduate not found"
            });
        }

        grad.Email = Graduate.Email;
        grad.MobileNumber = Graduate.MobileNumber;
        grad.Name = Graduate.Name;
        grad.Address = Graduate.Address;
        const bylaw = grad.Bylaw;
        await grad.save(); // Save the updated graduate information
        if(bylaw === "old" || bylaw === "Old"){
            for ( const course of Courses ) {
                console.log(course)
                let Course = await db.oldBaylaweEnrolledIn.findOne({
                    where: {
                        GraduateId: grad.GraduateId ,
                        courseId: course.courseId
                    }
                })
                Course.Year = course.enrolled_in.year;
                Course.Term = course.enrolled_in.Term;
                Course.Level = course.enrolled_in.Level;
                Course.Result = course.enrolled_in.Result;
                await Course.save();
            }
        }else if(bylaw === "new" || bylaw === "New"){
            // Update enrolled course information
            for ( const course of Courses ) {
                console.log(course)
                let Course = await db.enrolled_in.findOne({
                    where: {
                        GraduateId: grad.GraduateId ,
                        courseId: course.courseId
                    }
                })
                Course.Year = course.enrolled_in.year;
                Course.Term = course.enrolled_in.Term;
                Course.Level = course.enrolled_in.Level;
                Course.Result = course.enrolled_in.Result;
                await Course.save();
            }
        }


        res.json({
            status: "success",
            text: "Graduate updated successfully"
        });

    } catch (error) {
        console.error('Error updating graduate:', error);
        res.status(500).json({
            status: "error",
            text: 'Internal server error',
            error: error.message
        });
    }
};

const addGraduateCourseFromFile = asyncWrapper(async (req, res,next) => {
    try {
        const file = req.file;
        const bylaw = req.body.bylaw;
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



            if(bylaw === "old" || bylaw === "Old"){
                let uniqueIDs = new Set();
                for (const row of rows){
                    const graduate_id = parseInt(row.stud_id);
                    const graduate = await db.graduate.findByPk(graduate_id);

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
                    let [Courses] = await db.course.findOrCreate({
                        where: {courseName: row.subj_name}
                    });
                    const newCourse = await db.oldBaylaweEnrolledIn.create({
                        courseId : Courses.courseId,
                        courseName: row.subj_name,
                        Grade : grade,
                        Result:result,
                        Term:row.term,
                        Year:row.year,
                        Level:row.level,
                        GraduateId:row.stud_id,
                    })


                }
                for (const ID of uniqueIDs) {
                    await calcFinalGrade(ID)
                }
            }else if(bylaw === "new" || bylaw === "New"){
                for (const row of rows){
                    const graduate_id = parseInt(row.stud_id);
                    const graduate = await db.graduate.findByPk(graduate_id);

                    if(!graduate)
                    {
                        const error = appError.create('Wrong ID',404,httpStatus.FAIL);
                        return next(error);
                    }
                    let [Courses] = await db.course.findOrCreate({
                        where: {courseName: row.subj_name}
                    });
                    console.log("course",Courses.courseId)

                    const newCourse = await db.enrolled_in.create({
                    courseId : Courses.courseId,
                    courseName: row.subj_name,
                    Grade : row.grade,
                    Result:row.Result,
                    Term:row.term,
                    Year:row.year,
                    Level:row.level,
                    graduateId:row.stud_id,
                    creditHours : row.creditHours,
                    termWork : row.termWork,
                    examWork: row.examWork
                })

            }

        }

        fs.unlinkSync(file.path);
        return res.status(201).json({status: httpStatus.SUCCESS, message:"Added successfully"});

    } catch (error) {
        console.error('Error adding graduates from file:', error);
        res.status(500).send('Internal server error');
    }
});


module.exports = {
    addGraduate,
    getOneGraduate,
    getAllGraduates,
    addCourseToGraduate,
    deleteCourse,
    addGraduatesFromFile,
    getAllGraduatesOfDepartment,
    updateGraduate,
    addGraduateCourseFromFile
}
