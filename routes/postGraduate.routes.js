const express = require('express');
const {body} = require('express-validator');
const  {ApplyPostGrad,getPostGraduateRequest,getCourseWithID,Update,deleteCourse} = require('../controllers/postGraduate.controller.js');
const upload = require('../middleware/upload');
const TokenManipulation = require("../utils/TokenManipulation");
const allowedTo = require("../middleware/allowedTo");
const router = express.Router();


router.route('/')
        .get(TokenManipulation.verifyToken,allowedTo("Admin")
            ,getPostGraduateRequest) // get all the data from server
        .post(upload.fields([
                { name: 'personalPhoto', maxCount: 1 },
                { name: 'bachelorsCertificate', maxCount: 1 },
                { name: 'birthCertificate', maxCount: 1 },
                { name: 'workplaceApproval', maxCount: 1 },
                { name: 'armedForcesApproval', maxCount: 1 },
                { name: 'scoreReport', maxCount: 1 },
                { name: 'militaryCertificate', maxCount: 1 },
                { name: 'officersApproval', maxCount: 1 },
                { name: 'dataForm', maxCount: 1 },
                { name: 'informationForm', maxCount: 1 },
                { name: 'diplomaCertificate', maxCount: 1 },
                { name: 'candidacyLetter', maxCount: 1 },
                { name: 'adisCertificate', maxCount: 1 },
              ]),
            TokenManipulation.verifyToken,allowedTo("Admin"),
            ApplyPostGrad) // add new course to the list











module.exports = router