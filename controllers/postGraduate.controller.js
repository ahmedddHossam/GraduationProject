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
const transporter = require('../config/emailConfig');
const httpStatus = require("../utils/httpStatusText");


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
        const {NationalId} = req.params;
        const request = await db.postgraduateStudies.findAll({where:{nationalIDORPassport:NationalId}});
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
    async (req,res,next)=>{

        const data = req.body;
        console.log(data)

        try{
            const request = await db.postgraduateStudies.update(
                {'Status': data.Status}, // values to update
                {where: {'applicationId': data.applicationId}} // options
            );

            if (!request) {
                return res.status(404).json({ message: 'request not found' });
            }

            let email_text;

            if(data.Status === "Approved")
            {
                email_text = `Dear ${request.Name},I am pleased to inform you that your application to the ${request.program} program at the Faculty of Computer Science and Artificial Intelligence has been accepted 
                    You have been admitted to pursue your ${request.Studies} studies. We are excited to welcome you to our academic community and look forward to your contributions to the field.
                    Please visit the Faculty of Computer Science and Artificial Intelligence to complete the necessary enrollment procedures and obtain further details about your program.
                    
                    Congratulations on this significant achievement!

                    Best regards,
                    FCAI`;
            }

            else
            {
                email_text = `Dear ${request.Name},
` +
                    "\n" +
                    `Thank you for your application to the ${request.program} program at the Faculty of Computer Science and Artificial Intelligence. We appreciate your interest in our institution and the time and effort you put into your application.
` +
                    "\n" +
                    `After careful consideration, we regret to inform you that we are unable to offer you admission to the ${request.Studies}program at this time. The selection process was highly competitive, and we received a large number of exceptional applications.
` +
                    "\n" +
                    "We encourage you to continue pursuing your academic and professional goals and wish you the very best in your future endeavors.\n" +
                    "\n" +
                    "Thank you again for your interest in our program.\n" +
                    "\n" +
                    "Sincerely,\n" +
                    "\n" +
                    "FCAI";
            }


            // Send email to graduate
            const mailOptions = {
                from: process.env.EMAIL_ADMIN,
                to: request.Email,
                subject: `Application Status for ${request.Studies} at Faculty of Computer Science and Artificial Intelligence`,
                text: email_text, // change it later
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error)
                    throw new Error(error.message);
                }
            })
            return res.json({"status": httpStatusText.SUCCESS, data: "SUCCESS"});
        }
        catch (error)
        {
            const err = appError.create('Internal server error', 500, httpStatus.FAIL);
            return next(err);
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