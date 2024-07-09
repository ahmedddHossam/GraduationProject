
const asyncWrapper = require('../middleware/asyncWrapper');
const db = require('../models')
const appError = require('../utils/appError');
const httpStatus = require('../utils/httpStatusText');
const initializeSocket = require('../config/socketConfig');
const transporter = require('../config/emailConfig');
const fs = require('fs');
const path = require('path');
const {where} = require("sequelize");
require('dotenv').config();


const publish = asyncWrapper(async (req, res, next)=>{
    const {Title, Description, Requirements} = req.body;

    console.log(Title, Description, Requirements)
    if(!Title){
        const error = appError.create('Title is required',400,httpStatus.FAIL);
        return next(error);
    }

    if(!Description){
        const error = appError.create('Description is required',400,httpStatus.FAIL);
        return next(error);
    }

    if(!Requirements){
        const error = appError.create('Requirements is required',400,httpStatus.FAIL);
        return next(error);
    }

    try{
        // console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")
        console.log(req.currentUser)
        const admin = await db.admin.findOne({where:{userUserId:req.currentUser.id}});
        const newJob = new db.job({
            Title: Title,
            Description: Description,
            Requirements: Requirements,
            adminAdminId: admin.AdminId
        });
        const io = req.app.get('io');
        console.log(1)
        await newJob.save();
        console.log(2);
        await Notify(newJob,io);

        return res.status(201).json({status: httpStatus.SUCCESS, data:{data:newJob,message:'Job added successfully'}});
    }
    catch (err)
    {
        // console.error('Error publishing job:', err);
        console.log(err)
        res.status(500).json({ error: 'Internal server error' });
    }
})

const getJobNotificationsForGraduate = asyncWrapper(async (req, res, next) => {
    const user_email = req.currentUser.email;

    const graduate = await db.graduate.findOne({where:{Email:user_email}});

    const graduateId = graduate.GraduateId

    if (!graduateId) {
        const error = appError.create('graduate id is required', 400, httpStatus.FAIL);
        return next(error);
    }

    // Extract limit and offset from query parameters, with default values
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    try {
        const graduate = await db.graduate.findByPk(graduateId);
        console.log(graduate)

        if (!graduate) {
            const error = appError.create('Wrong ID', 404, httpStatus.FAIL);
            return next(error);
        }

        // Retrieve job notifications for the graduate from the database with pagination
        const notifications = await db.jobPublishNotification.findAll({
            where: { graduateGraduateId: graduateId },
            limit: limit,
            offset: offset,});

        return res.status(200).json({ status: httpStatus.SUCCESS, data: notifications });
    } catch (error) {
        console.error('Error retrieving job notifications:', error);
        const err = appError.create('Internal server error', 500, httpStatus.FAIL);
        return next(err);
    }
});
const deleteJob = asyncWrapper(async (req, res, next) => {
    const jobId = req.params.jobId;
    try {
        const job = await db.job.findByPk(jobId);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Delete all applications associated with the job
        await db.application.destroy({ where: { jobJobId:jobId } });

        // Now delete the job itself
        await job.destroy();

        res.status(200).json({ message: 'Job and associated applications deleted successfully' });
    } catch (err) {
        console.error(err);
        const error = appError.create('Internal server error', 500, httpStatus.FAIL);
        return next(error);
    }
});
const updateJob = asyncWrapper(async (req,res,next)=>{
    const jobId = req.params.jobId;
    const { Title,Description, Requirements } = req.body; // Add other fields as necessary

    // console.log(jobId ,req.body)
    try {
        const job = await db.job.findByPk(jobId);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        // Update job fields
        job.Title = Title || job.Title;
        job.Description = Description || job.Description;
        job.Requirements = Requirements || job.Requirements;
        // Update other fields as necessary

        await job.save();
        res.status(200).json({ message: 'Job updated successfully', job });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred', error: error.message });
    }
})
async function Notify(newJob,io)
{
    try {
        const graduates = await db.graduate.findAll();
        for (const graduate of graduates) {
            // console.log(graduate)
            // Store the job notification in the database for each graduate
            const newNotification = await new db.jobPublishNotification({
                graduateGraduateId:graduate.GraduateId,
                jobJobId:newJob.JobId
            });
            await newNotification.save();

        }
        io.emit('newJob',newJob);
    }
    catch (error) {
        console.error('Error notifying graduates about new job:', error);
    }
}


const apply = asyncWrapper(async (req,res,next)=>{

    const userEmail  = req.currentUser.email ; // solve it with hoss
    const { jobId } = req.params;

    console.log(userEmail,jobId)
    const graduate = await db.graduate.findOne({where:{Email:userEmail }});
    console.log(graduate);
    const job = db.job.findByPk(jobId);



    if(!graduate){
        const error = appError.create('Wrong ID',404,httpStatus.FAIL);
        return next(error);
    }
    if(!job){
        const error = appError.create('job not found',404,httpStatus.FAIL);
        return next(error);
    }
    let existingAssociation = await db.application.findOne({
        where: {
            graduateGraduateId: graduate.GraduateId,
            jobJobId: jobId
        }
    });
    if(existingAssociation)
    {
        return res.status(400).json({
            status: httpStatus.FAIL,
            message: 'You have already applied for this job.'
        });
    }
   try {


       const application = await db.application.create({
           status: 'Pending',
           cvPath: req.file.path,
           graduateGraduateId: graduate.GraduateId,
           jobJobId: jobId,
           TImestamp: Date.now()

       });


       return res.status(201).json({status: httpStatus.SUCCESS, data: {message: "applied successfully"}});

   }
    catch (err)
    {
        console.error(err);
        const error = appError.create('Internal server error', 500, httpStatus.FAIL);
        return next(error);
    }

})

const getApplicationsForGraduate = asyncWrapper(async (req, res, next) => {
    const email = req.currentUser.email;

    if (!email) {
        const error = appError.create('Login Required', 401, httpStatus.FAIL);
        return next(error);
    }

    const graduate = await db.graduate.findOne({where:{
        Email:email
    }});

    if (!graduate) {
        const error = appError.create('Wrong ID', 404, httpStatus.FAIL);
        return next(error);
    }

    // Extract limit and offset from query parameters, with default values
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    try {
        const applications = await db.application.findAll({
            where: { graduateGraduateId: graduate.GraduateId },
            include: [db.job], // Include the job details
            limit: limit,
            offset: offset
        });

        return res.status(200).json({
            status: httpStatus.SUCCESS,
            data: applications
        });
    } catch (error) {
        console.error('Error retrieving applications:', error);
        const err = appError.create('Internal server error', 500, httpStatus.FAIL);
        return next(err);
    }
});

const getApplications = asyncWrapper(async (req, res, next) => {
    // Extract limit and offset from query parameters, with default values
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    try {
        const applications = await db.application.findAll({
            include: [db.job], // Include the job details
            where: { status: 'Pending' }, // Filter applications by status
            order: [['jobJobId', 'ASC']], // Order by job ID in ascending order
            limit: limit,
            offset: offset,
        });
        console.log(applications);

        // Group applications by job
        const groupedApplications = applications.reduce((acc, application) => {
            const jobId = application.jobJobId;
            if (!acc[jobId]) {
                acc[jobId] = {
                    id: application.job.JobId, // Include job details
                    title: application.job.Title,
                    description: application.job.Description,
                    requirements: application.job.Requirements,
                    applicants: []
                };
            }
            let cvContent = '';
            const cvPath = application.cvPath;
            const fullPath = `E:\\GP\\GraduationProject\\${cvPath}`;

            if (cvPath) {
                console.log(cvPath)
                try {
                    cvContent = fs.readFileSync(fullPath).toString('base64'); // Read the file and convert it to base64
                } catch (err) {
                    console.error(`Error reading CV file at ${fullPath}:`, err);
                }
            }

            acc[jobId].applicants.push({
                id: application.applicationId,
                name: application.graduateGraduateId, // Assuming 'name' is the field for applicant's name, adjust if needed
                cv: cvContent,
                cvPath:cvPath

            });
            return acc;
        }, {});

        // Convert the object to an array of objects
        const jobApplications = Object.values(groupedApplications);

        console.log(jobApplications)
        return res.status(200).json({
            status: httpStatus.SUCCESS,
            data: jobApplications
        });
    } catch (error) {
        console.error('Error retrieving applications:', error);
        const err = appError.create('Internal server error', 500, httpStatus.FAIL);
        return next(err);
    }
});

const getJobs = asyncWrapper(async (req, res, next) => {
    // Extract limit and offset from query parameters, with default values
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    try {
        const jobs = await db.job.findAll({
            limit: limit,
            offset: offset
        });

        return res.status(200).json({
            status: httpStatus.SUCCESS,
            data: jobs
        });
    } catch (error) {
        console.error('Error retrieving applications:', error);
        const err = appError.create('Internal server error', 500, httpStatus.FAIL);
        return next(err);
    }
});

const updateApplicationStatus = asyncWrapper(async (req,res,next)=>{
    const {applicationId}  = req.params;
    const status  = req.body.status;

    console.log(applicationId)
    const application = await db.application.findByPk(applicationId);

    if (!application) {
        const error = appError.create('Application not found', 404, httpStatus.FAIL);
        return next(error);
    }

    application.Status = status;
    await application.save();
    console.log(application.graduateGraduateId)

    const GraduateId = application.graduateGraduateId;

    const graduate = await db.graduate.findByPk(GraduateId);
    console.log(graduate)
    const job = await db.job.findByPk(application.jobJobId);

    const email_text =`Dear ${graduate.Name},
` +
        "\n" +
        `I hope this message finds you well. I am pleased to inform you that after careful consideration, we have selected you for the ${job.Title} position.
` +
        "\n" +
        "We were impressed with your skills, and we believe that your experience and enthusiasm will be valuable to our team. We are excited about the prospect of you joining us.\n" +
        "\n" +
        "Please find attached the formal offer letter detailing your compensation, benefits, and other relevant details. Kindly review the offer and let us know if you have any questions or if there are any adjustments needed before you formally accept the offer.\n" +
        "\n" +
        "We look forward to your positive response and to welcoming you aboard. Congratulations once again on your new role!\n" +
        "\n" +
        "Best regards,\n" +
        "\n" +
        "FCAI";

    // Send email to graduate
    const mailOptions = {
        from: process.env.EMAIL_ADMIN,
        to: graduate.Email,
        subject: 'Job Offer - Congratulations!',
        text: email_text, // change it later
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error)
            throw new Error(error.message);
        }
    });

    return res.status(200).json({
        status: httpStatus.SUCCESS,
        message : "Application updated successfully"
    });

});

module.exports = {
    getJobNotificationsForGraduate,
    publish, // done
    deleteJob, // done
    updateJob,//done
    apply,// done
    getJobs,//done
    getApplicationsForGraduate, // lesa
    getApplications,
    updateApplicationStatus
};

