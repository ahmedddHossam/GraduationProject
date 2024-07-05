const {body,validationResult} = require('express-validator');
const db = require('../models/index');
const httpStatusText = require('../utils/httpStatusText')
const fs = require('fs');
const asyncWrapper = require('../middleware/asyncWrapper')
const appError = require('../utils/appError')
const upload = require('../middleware/upload')
const util = require('util');
const moment = require("moment");

const unlinkAsync = util.promisify(fs.unlink);



//get all requests
const getPostGraduateAllRequest =asyncWrapper(
    async (req,res)=>{
    const query = req.query;
    const limit = query.limit || 10;
    const page = query.page || 1;
    const skip = (page - 1) * limit;
    const requests = await db.postgraduateStudies.findAll();
    res.json({"status":httpStatusText.SUCCESS,
            "data":{"requests":requests}
        });
}
);

//get requests
const getPostGraduateRequest =asyncWrapper(
    async (req,res)=>{
        const {id} = req.params;
        const request = await db.postgraduateStudies.findByPk(id);
        res.json({"status":httpStatusText.SUCCESS,
            "data":{"request":request}
        });
    }
);

const updateStatus = asyncWrapper(
    async (req,res)=>{
        const data = req.body;
        console.log(data)
        const request = await db.postgraduateStudies.update(
            { 'Status': data.Status }, // values to update
            { where: { 'applicationId': data.applicationId } } // options
        );
        if(request){
            return res.json({"status":httpStatusText.SUCCESS,data:"SUCCESS"});
        }
    }
)

// Make a post graduate request
const ApplyPostGrad = asyncWrapper(async (req, res) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        const postData = { ...req.body};
        const certFields = ['personalPhoto','bachelorsCertificate','militaryCertificate','dataForm','informationForm','armedForcesApproval','officersApproval','scoreReport','birthCertificate','workplaceApproval','nationalIdCard'];

        for (const field of certFields) {
            if (req.files && req.files[field]) {
                // Save file path to the corresponding field
                postData[field] = String(req.files[field][0]['path']);
            }
        }
        postData['Status'] = 'pending';
        console.log(postData);
        //Save the request to the database
        const newPostReq =  db.postgraduateStudies.build(postData);
        await newPostReq.save();

        res.status(201).json({ status: httpStatusText.SUCCESS, data: { request: newPostReq } });
    } else {
        // Delete uploaded file if there are validation errors
        if (req.file) {
            await unlinkAsync(req.file.path);
        }
        res.status(400).json({ status: httpStatusText.FAIL, data: { errors: errors.array() } });
    }
});


module.exports ={
    getPostGraduateRequest,ApplyPostGrad,getPostGraduateAllRequest,updateStatus
}