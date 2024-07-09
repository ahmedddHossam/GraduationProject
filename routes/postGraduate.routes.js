const express = require('express');
const {body} = require('express-validator');

const  {getPostGraduateRequest,getPostGraduateAllRequest,ApplyPostGradForeinger,ApplyPostGradEgyptian,updateStatus,downloadRequestFiles} = require('../controllers/postGraduate.controller.js');

const TokenManipulation = require("../utils/TokenManipulation");
const allowedTo = require("../middleware/allowedTo");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const fs = require("fs");
const uploadPath = 'uploads/documents';
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/documents');
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


router.route('/')
        .get(TokenManipulation.verifyToken,allowedTo(["Post Graduate Studies Admin"])
            ,getPostGraduateAllRequest)
    .patch(TokenManipulation.verifyToken,allowedTo(["Post Graduate Studies Admin"]),updateStatus) // add new course to the list


router.route('/download/:id')
    .get(TokenManipulation.verifyToken,allowedTo(["Post Graduate Studies Admin"]),downloadRequestFiles)

router.route('/egyptian').post(upload.fields([
    { name: 'personalPhoto', maxCount: 1 },
    { name: 'bachelorsCertificate', maxCount: 1 },
    { name: 'birthCertificate', maxCount: 1 },
    { name: 'workplaceApproval', maxCount: 1 },
    { name: 'armedForcesApproval', maxCount: 1 },
    { name: 'officersApproval', maxCount: 1 },
    { name: 'scoreReport', maxCount: 1 },
    { name: 'nationalIdCardOrPassport', maxCount: 1 },
    { name: 'militaryCertificate', maxCount: 1 },
    { name: 'diplomaCertificate', maxCount: 1 },
]),ApplyPostGradEgyptian)
router.route('/Foreigner').post(upload.fields([
    { name: 'personalPhoto', maxCount: 1 },
    { name: 'bachelorsCertificate', maxCount: 1 },
    { name: 'birthCertificate', maxCount: 1 },
    { name: 'scoreReport', maxCount: 1 },
    { name: 'nationalIdCardOrPassport', maxCount: 1 },
    { name: 'candidacyLetter', maxCount: 1 },
    { name: 'informationForm', maxCount: 1 },
    { name: 'dataForm', maxCount: 1 },
    { name: 'adisCertificate', maxCount: 1 },
    { name: 'diplomaCertificate', maxCount: 1 },
]),ApplyPostGradForeinger);

router.route('/getPostGraduateRequest/:NationalId').get(getPostGraduateRequest)

module.exports = router