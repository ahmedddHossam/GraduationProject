const asyncWrapper = require('../middleware/asyncWrapper');
const db = require('../models')
const appError = require('../utils/appError');
const httpStatus = require('../utils/httpStatusText');
const initializeSocket = require('../config/socketConfig');
const transporter = require('../config/emailConfig');


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
        console.log(1)
        await newJob.save();
        console.log(2)
        await Notify(newJob);

        return res.status(201).json({status: httpStatus.SUCCESS, data: {message: "Job Published successfully"}});
    }
    catch (err)
    {
        // console.error('Error publishing job:', err);
        console.log(err)
        res.status(500).json({ error: 'Internal server error' });
    }
})

const getJobNotificationsForGraduate = asyncWrapper(async (req, res, next) => {
    const graduateId = req.params.graduateId;

    if (!graduateId) {
        const error = appError.create('graduate id is required', 400, httpStatus.FAIL);
        return next(error);
    }

    // Extract limit and offset from query parameters, with default values
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    try {
        const graduate = await db.graduate.findByPk(graduateId);

        if (!graduate) {
            const error = appError.create('Wrong ID', 404, httpStatus.FAIL);
            return next(error);
        }

        // Retrieve job notifications for the graduate from the database with pagination
        const notifications = await db.jobPublishNotification.findAll({
            where: { GraduateId: graduateId },
            limit: limit,
            offset: offset
        });

        return res.status(200).json({ status: httpStatus.SUCCESS, data: notifications });
    } catch (error) {
        console.error('Error retrieving job notifications:', error);
        const err = appError.create('Internal server error', 500, httpStatus.FAIL);
        return next(err);
    }
});

async function Notify(newJob)
{
    const io = initializeSocket.getSocketServer();
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
        io.emit('newJob',JSON.stringify(newJob));
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

    const job = db.job.findByPk(jobId);

    if(!graduate){
        const error = appError.create('Wrong ID',404,httpStatus.FAIL);
        return next(error);
    }
    if(!job){
        const error = appError.create('job not found',404,httpStatus.FAIL);
        return next(error);
    }
   try {


       const application = await db.application.create({
           status: 'Pending',
           cvPath: req.file.path,
           graduateGraduateId: graduate.GraduateId,
           jobJobId: jobId,
           TImestamp: Date.now()

       });

       const io = initializeSocket.getSocketServer();
       // io.emit('apply for job', JSON.stringify(application));
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
    const { graduateId } = req.params;

    if (!graduateId) {
        const error = appError.create('graduate id is required', 400, httpStatus.FAIL);
        return next(error);
    }

    const graduate = await db.graduate.findByPk(graduateId);

    if (!graduate) {
        const error = appError.create('Wrong ID', 404, httpStatus.FAIL);
        return next(error);
    }

    // Extract limit and offset from query parameters, with default values
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    try {
        const applications = await db.application.findAll({
            where: { GraduateId: graduateId },
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
    const { applicationId } = req.params;
    const { status } = req.body;

    const application = await db.application.findOne({
        where: { id: applicationId },
        include: [db.graduate],
    });


    if (!application) {
        const error = appError.create('Application not found', 404, httpStatus.FAIL);
        return next(error);
    }

    application.status = status;
    await application.save();

    const graduate = db.graduate.findByPk(application.GraduateId);


    // Send email to graduate
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: graduate.Email,
        subject: 'Job Application Status',
        text: `Your application for the job has been ${status}.`, // change it later
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
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
    publish,
    apply,
    getJobs,
    getApplicationsForGraduate,
    getApplications,
    updateApplicationStatus
};
