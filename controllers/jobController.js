const asyncWrapper = require('../middleware/asyncWrapper');
const db = require('../models')
const appError = require('../utils/appError');
const httpStatus = require('../utils/httpStatusText');
const initializeSocket = require('../config/socketConfig');
const transporter = require('../config/emailConfig');


const publish = asyncWrapper(async (req, res, next)=>{
    const {Title, Description, Requirements} = req.body;

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
        const newJob = new db.job({
            Title: Title,
            Description: Description,
            Requirements: Requirements,
            adminAdminId: req.currentUser.id
        });
        await newJob.save();
        await Notify(newJob);
        return res.status(201).json({status: httpStatus.SUCCESS, data: {message: "Job Published successfully"}});
    }
    catch (err)
    {
        // console.error('Error publishing job:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
})

const getJobNotificationsForGraduate=asyncWrapper(async (req, res,next) => {

    const graduateId = req.params

    try {
        const graduate = await db.graduate.findByPk(graduateId);

        if (!graduate) {
            const error = appError.create('Wrong ID', 404, httpStatus.FAIL);
            return next(error);
        }

        // Retrieve job notifications for the graduate from the database
        const notifications = await db.jobPublishNotification.findAll({where: {GraduateId:graduateId}});
        return res.json(notifications);
    }
    catch (error) {
        console.error('Error retrieving job notifications:', error);
        return res.status(500).json({ error: 'Internal server error' });
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
                GraduateId:graduate.GraduateId,
                JobId:newJob.id
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
    const { userEmail } = req.currentUser.email ; // solve it with hoss
    const { jobId } = req.params;

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
    const application = await db.application.create({
        status: 'Pending',
        cvPath: req.file.path,
        GraduateId: graduate.GraduateId,
        JobId: jobId,
    });
    return res.status(201).json({status: httpStatus.SUCCESS, data: {message: "applied successfully"}});
})

const getApplicationsForGraduate=asyncWrapper(async (req,res,next)=>
{
    const { graduateId } = req.params;

    const graduate = await db.graduate.findByPk(graduateId);

    if (!graduate) {
        const error = appError.create('Wrong ID', 404, httpStatus.FAIL);
        return next(error);
    }

    const Applications = await db.application.findAll({
        where: { GraduateId: graduateId },
        include: [db.job] // Include the job details
    });

    return res.status(200).json({
        status: httpStatus.SUCCESS,
        data: Applications
    });
});
const getApplications=asyncWrapper(async (req,res,next)=>
{

    const Applications = await db.application.findAll({
        include: [db.job] // Include the job details
    });
    return res.status(200).json({
        status: httpStatus.SUCCESS,
        data: Applications
    });
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
    getApplicationsForGraduate,
    getApplications,
    updateApplicationStatus
};
