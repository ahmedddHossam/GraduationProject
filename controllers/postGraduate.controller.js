const {body,validationResult} = require('express-validator');
const db = require('../models/index');
const httpStatusText = require('../utils/httpStatusText');
const fs = require('fs');
const asyncWrapper = require('../middleware/asyncWrapper')
const appError = require('../utils/appError')
const upload = require('../middleware/upload')
const util = require('util');
const moment = require("moment");
const archiver = require('archiver');
const unlinkAsync = util.promisify(fs.unlink);
const path = require('path')


//get all requests
const getPostGraduateAllRequest =asyncWrapper(
    async (req,res)=>{
    const query = req.query;
    const limit = query.limit || 10;
    const page = query.page || 1;
    const skip = (page - 1) * limit;
    const requests = await db.postgraduateStudies.findAll();
    console.log(requests)
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

const downloadRequestFiles = asyncWrapper(
    async (req,res)=>{
        const {id} = req.params;

        try {
            // Assume you fetch files paths from the database based on postId
            const requests = await db.postgraduateStudies.findOne({
                where:{
                    nationalIDORPassport:id
                }
            });
            console.log(requests.dataValues)
            const filePaths = Object.values(requests.dataValues).filter(value => typeof value === 'string' && value.startsWith('uploads\\'));

            console.log(filePaths);



            if (!filePaths || filePaths.length === 0) {
                return res.status(404).json({ message: 'No files found for this post' });
            }

            // Create a zip archive
            const zipFileName = `post_${id}_files.zip`;
            const zipPath = `./${zipFileName}`;
            const output = fs.createWriteStream(zipPath);
            const archive = archiver('zip', {
                zlib: { level: 9 } // Compression level (higher is better)
            });

            output.on('close', () => {
                console.log(archive.pointer() + ' total bytes');
                console.log(`Zip file ${zipFileName} created successfully`);
                res.download(zipPath, zipFileName, (err) => {
                    if (err) {
                        console.error('Download error:', err);
                    }
                    // Delete the zip file after download
                    fs.unlinkSync(zipPath);
                });
            });

            archive.on('error', (err) => {
                throw err;
            });

            archive.pipe(output);

            // Add files to the zip archive
            for (const filePath of filePaths) {
                archive.file(filePath, { name: `${id}/${path.basename(filePath)}` });
            }

            // Finalize the archive
            archive.finalize();

        } catch (error) {
            console.error('Error creating zip file:', error);
            res.status(500).json({ message: 'Failed to create zip file' });
        }

}
)

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
const ApplyPostGradEgyptian = asyncWrapper(async (req, res) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        const postData = { ...req.body};
        let certFields = ['personalPhoto','bachelorsCertificate','militaryCertificate','armedForcesApproval','officersApproval','scoreReport','birthCertificate','workplaceApproval','nationalIdCardOrPassport'];
        if(postData.Studies==="PhD"){
            certFields.push("diplomaCertificate");
        }
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

const ApplyPostGradForeinger = asyncWrapper(async (req, res) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        const postData = { ...req.body};
        const certFields = ['personalPhoto','bachelorsCertificate','candidacyLetter','dataForm','informationForm','scoreReport','birthCertificate','nationalIdCardOrPassport','adisCertificate'];
        if(postData.Studies==="PhD"){
            certFields.push("diplomaCertificate");
        }
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
    getPostGraduateRequest,ApplyPostGradEgyptian,ApplyPostGradForeinger,downloadRequestFiles,getPostGraduateAllRequest,updateStatus
}