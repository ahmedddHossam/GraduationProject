const {body,validationResult} = require('express-validator');
const PostgraduateStudies = require('../models/PostgraduateStudiesModel');
const httpStatusText = require('../utils/httpStatusText')
const fs = require('fs');
const asyncWrapper = require('../middleware/asyncWrapper')
const appError = require('../utils/appError')
const upload = require('../middleware/upload')
const util = require('util');

const unlinkAsync = util.promisify(fs.unlink);

const getPostGraduateRequest =asyncWrapper(
    async (req,res)=>{
    const query = req.query
    //get all courses
    const limit = query.limit || 10;
    const page = query.page || 1;
    const skip = (page - 1) * limit
    const requests = await PostgraduateStudies.find({},{'__v':false}).limit(limit).skip(skip);
    res.json({"status":httpStatusText.SUCCESS,
            "data":{"requests":requests}
        });
}
);


const ApplyPostGrad = asyncWrapper(async (req, res) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        const postData = { ...req.body};
        
        // Handle file uploads for fields containing "Cert"
        const certFields = ['personalPhoto','bachelorsCertificate','militaryCertificate','dataForm','informationForm','armedForcesApproval','officersApproval','scoreReport','birthCertificate','adisCertificate','workplaceApproval','diplomaCertificate','candidacyLetter']

        for (const field of certFields) {
            if (req.files && req.files[field]!==undefined) {
                // Save file path to the corresponding field
                postData[field] = req.files[field][0]['path'];
            }
        }
        console.log(await PostgraduateStudies(postData));
        //Save the request to the database
        // const newPostReq =  PostgraduateStudies().build(postData);
        // console.log(newPostReq )
        //await newPostReq.save();

        //res.status(201).json({ status: httpStatusText.SUCCESS, data: { request: request } });
    } else {
        // Delete uploaded file if there are validation errors
        if (req.file) {
            await unlinkAsync(req.file.path);
        }
        res.status(400).json({ status: httpStatusText.FAIL, data: { errors: errors.array() } });
    }
});


module.exports ={
    getPostGraduateRequest,ApplyPostGrad
}