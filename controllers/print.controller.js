const {body,validationResult} = require('express-validator');
const db = require('../models/index');
const httpStatusText = require('../utils/httpStatusText')
const fs = require('fs');
const asyncWrapper = require('../middleware/asyncWrapper')
const appError = require('../utils/appError')
const util = require('util');
const path = require('path');
const PizZip = require("pizzip");
const moment = require("moment");
const Docxtemplater = require("docxtemplater");
const Graduate = db.graduate;


//print grad cert
const grad =asyncWrapper(
    async (req,res)=> {
        const data = req.body;
        let graduate = await Graduate.findByPk(data.graduateID);

        const graduateData =graduate.dataValues
        graduateData.issue_date=String(moment().format('YYYY-MM-DD'));

        let date = new Date(graduateData.StartDate);
        let day = String(date.getDate()).padStart(2, '0');
        let month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        let year = date.getFullYear();

// Format the date as DD-MM-YYYY
        graduateData.StartDate = `${day}-${month}-${year}`;
        console.log(graduateData.StartDate)
        date = new Date(graduateData.EndDate)
        day = String(date.getDate()).padStart(2, '0');
        month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        year = date.getFullYear();
        graduateData.EndDate = `${day}-${month}-${year}`;

        date = new Date(graduateData.BirthDate)
        day = String(date.getDate()).padStart(2, '0');
        month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        year = date.getFullYear();
        graduateData.BirthDate = `${day}-${month}-${year}`;

        let templatePath = path.resolve(__dirname, '../documents/EnglishCert.docx')
        if(data.lang==='Arabic'){
                templatePath = path.resolve(__dirname,'../documents/maleArabicCert.docx')
        }
        const content = fs.readFileSync(
            templatePath,
            "binary"
        );
        // Unzip the content of the file
        const zip = new PizZip(content);

// This will parse the template, and will throw an error if the template is
// invalid, for example, if the template is "{user" (no closing tag)
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
        });

        // Render the document (Replace {first_name} by John, {last_name} by Doe, ...)
        doc.render(graduateData);

        // Get the zip document and generate it as a nodebuffer
        const buf = doc.getZip().generate({
            type: 'nodebuffer',
            // compression: DEFLATE adds a compression step.
            // For a 50MB output document, expect 500ms additional CPU time
            compression: 'DEFLATE',
        });

        // Define the output path
        const outputPath = path.resolve(__dirname, '../documents/'+String(graduateData.GraduateId)+'Cert.docx');

        // Write the buffer to a file
        fs.writeFileSync(outputPath, buf);

        // Optionally, you can also send the file as a response
        // Set response headers to indicate the file type and attachment
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename=`+String(graduateData.GraduateId)+`Cert.docx`);

        // Send the buffer as response
        return res.status(200).send(buf);
    }
);


// Print Verfication Letter
const verficationLetter =asyncWrapper(
    async (req,res)=> {
            const data = req.body;
            let graduate = await Graduate.findByPk(data.graduateID);

            const graduateData =graduate.dataValues
            graduateData.issue_date=String(moment().format('YYYY-MM-DD'));

            let date = new Date(graduateData.StartDate);
            let day = String(date.getDate()).padStart(2, '0');
            let month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
            let year = date.getFullYear();

// Format the date as DD-MM-YYYY
            graduateData.StartDate = `${day}-${month}-${year}`;
            console.log(graduateData.StartDate)
            date = new Date(graduateData.EndDate)
            day = String(date.getDate()).padStart(2, '0');
            month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
            year = date.getFullYear();
            graduateData.EndDate = `${day}-${month}-${year}`;

            date = new Date(graduateData.BirthDate)
            day = String(date.getDate()).padStart(2, '0');
            month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
            year = date.getFullYear();
            graduateData.BirthDate = `${day}-${month}-${year}`;

            let templatePath = path.resolve(__dirname, '../documents/EnglishLetter.docx')
            if(data.lang==='Arabic'){
                    templatePath = path.resolve(__dirname,'../documents/maleArabicCert.docx')
            }
            const content = fs.readFileSync(
                templatePath,
                "binary"
            );
            // Unzip the content of the file
            const zip = new PizZip(content);

// This will parse the template, and will throw an error if the template is
// invalid, for example, if the template is "{user" (no closing tag)
            const doc = new Docxtemplater(zip, {
                    paragraphLoop: true,
                    linebreaks: true,
            });

            // Render the document (Replace {first_name} by John, {last_name} by Doe, ...)
            doc.render(graduateData);

            // Get the zip document and generate it as a nodebuffer
            const buf = doc.getZip().generate({
                    type: 'nodebuffer',
                    // compression: DEFLATE adds a compression step.
                    // For a 50MB output document, expect 500ms additional CPU time
                    compression: 'DEFLATE',
            });

            // Define the output path
            const outputPath = path.resolve(__dirname, '../documents/'+String(graduateData.GraduateId)+'Letter.docx');

            // Write the buffer to a file
            fs.writeFileSync(outputPath, buf);

            // Optionally, you can also send the file as a response
            // Set response headers to indicate the file type and attachment
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            res.setHeader('Content-Disposition', `attachment; filename=`+String(graduateData.GraduateId)+`Letter.docx`);

            // Send the buffer as response
            return res.status(200).send(buf);
    }
);


module.exports ={
    grad,verficationLetter
}