const express = require('express');
const jobController = require("../Controllers/JobController");
const multer = require('multer');
const path = require('path');
const TokenManipulation = require('../utils/TokenManipulation');
const route = express.Router();
const allowedTo = require('../middleware/allowedTo')
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/CVs');
    },
    filename: (req, file, cb) => {
        cb(null, `${file.originalname}`);
    },
});

const fileFilter = (req, file, cb) => {
    const allowedFileTypes = /pdf|doc|docx/;
    const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedFileTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Error: File type not allowed! Only PDF, Word, PNG, and JPG files are accepted.');
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
});

route.route('/Publish')
    .post(TokenManipulation.verifyToken,
        allowedTo(["Post Graduate Studies Admin", "Graduate Affairs Admin", "Super Admin"])
        ,jobController.publish)

route.route('/getNew')
    .get(TokenManipulation.verifyToken,allowedTo(["Graduate"])
        ,jobController.getJobNotificationsForGraduate);

route.route('/apply/:jobId').
post(TokenManipulation.verifyToken,allowedTo(["Graduate"]),upload.single('cv'),jobController.apply);

route.route('/getApplicationsForGraduate').
get(TokenManipulation.verifyToken,allowedTo(["Graduate"]),jobController.getApplicationsForGraduate)

route.route('/getAllApplications')
    .get(TokenManipulation.verifyToken,
    allowedTo(["Post Graduate Studies Admin", "Graduate Affairs Admin", "Super Admin"])
    ,jobController.getApplications);

route.route('/getAllJobs').
get(    TokenManipulation.verifyToken,allowedTo(["Graduate", "Post Graduate Studies Admin", "Graduate Affairs Admin", "Super Admin"])
    ,jobController.getJobs);

route.route('/updateApplicationStatus/:applicationId')
    .patch(TokenManipulation.verifyToken,allowedTo(["Post Graduate Studies Admin", "Graduate Affairs Admin", "Super Admin"])
        ,jobController.updateApplicationStatus);

route.route('/updateJob/:jobId')
    .patch(TokenManipulation.verifyToken,allowedTo(["Post Graduate Studies Admin", "Graduate Affairs Admin", "Super Admin"])
        ,jobController.updateJob);
route.route('/deleteJob/:jobId')
    .delete(TokenManipulation.verifyToken,allowedTo(["Post Graduate Studies Admin", "Graduate Affairs Admin", "Super Admin"])
        ,jobController.deleteJob);

// route.route('/getAllNotification')
//     .get(TokenManipulation.verifyToken,allowedTo(["Graduate"]),jobController.getAllJobNotificationForGraduate);

module.exports=route;
