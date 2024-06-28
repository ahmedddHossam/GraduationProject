const express = require('express');
const {body} = require('express-validator');
const  {ApplyPostGrad,getPostGraduateRequest,getPostGraduateAllRequest,updateStatus} = require('../controllers/postGraduate.controller.js');
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
                { name: 'nationalIdCard', maxCount: 1 },
              ]),
            ApplyPostGrad).patch(updateStatus) // add new course to the list
router.route('/:id')
    .get(TokenManipulation.verifyToken,allowedTo("Admin"),getPostGraduateRequest)
 



module.exports = router