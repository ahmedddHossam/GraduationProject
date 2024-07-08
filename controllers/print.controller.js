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
const oldBaylawGraduate = db.oldBaylawGraduate;


const translateValues = (data, translationDict) => {
    let translatedData = {};
    for (let key in data) {
        if (data.hasOwnProperty(key)) {
            translatedData[key] = translationDict[data[key]] || data[key];
        }
    }
    return translatedData;
};
const translationDict = {
    "A": "ممتاز",
    "B": "جيد جدًا",
    "C": "جيد",
    "D": "مقبول",
    "F": "راسب",
    "IS": "نظم المعلومات",
    "CS": "علوم الحاسوب",
    "DS": "دعم القرار",
    "AI": "ذكاء اصطناعي",
    "Egyptian": "مصري",
    "old": "قديم",
    "new": "جديد",
    "Male": "ذكر",
    "Female": "أنثى",
    "Mathematics I": "الرياضيات I",
    "Discrete Mathematics": "الرياضيات المتقطعة",
    "Arabic Language": "اللغة العربية",
    "English": "اللغة الإنجليزية",
    "Introduction to Computers and Applications": "مقدمة في الحاسوب والتطبيقات",
    "Introduction to Management": "مقدمة في الإدارة",
    "Mathematics II": "الرياضيات II",
    "Computer Programming": "برمجة الحاسوب",
    "Physics": "الفيزياء",
    "Probabilities and Statistical Distributions": "الاحتمالات والتوزيعات الإحصائية",
    "Mathematics III": "الرياضيات III",
    "Logic Design": "تصميم المنطق",
    "Data Structures": "هياكل البيانات",
    "Introduction to Economics": "مقدمة في الاقتصاد",
    "Introduction to System Science": "مقدمة في علم النظم",
    "Operating Systems I": "أنظمة التشغيل I",
    "Mathematics IV": "الرياضيات IV",
    "Statistical Methods": "الأساليب الإحصائية",
    "Files Organization and Processing": "تنظيم ومعالجة الملفات",
    "Introduction to Operations Research": "مقدمة في بحوث العمليات",
    "Database Systems I": "نظم قواعد البيانات I",
    "Concepts Of Programming Languages": "مفاهيم لغات البرمجة",
    "Computer Organization": "تنظيم الحاسوب",
    "Software Engineering I": "هندسة البرمجيات I",
    "Computer Graphics I": "رسومات الحاسوب I",
    "Database Systems II": "نظم قواعد البيانات II",
    "Software Engineering II": "هندسة البرمجيات II",
    "Artificial Intelligence": "الذكاء الاصطناعي",
    "Computer Networks I": "شبكات الحاسوب I",
    "Assembly Language Programming": "برمجة لغة التجميع",
    "Knowledge Based Systems": "أنظمة قائمة على المعرفة",
    "Multimedia": "الوسائط المتعددة",
    "Selected Topics": "مواضيع مختارة",
    "Computer Arabization": "تعريب الحاسوب",
    "Operating Systems II": "أنظمة التشغيل II",
    "Selected Topics in Computer Science": "مواضيع مختارة في علوم الحاسوب",
    "Compiler Design": "تصميم المترجم",
    "Distributed Systems": "أنظمة موزعة",
    "Natural Language Processing": "معالجة اللغة الطبيعية",
    "Digital Image Processing": "معالجة الصور الرقمية"
};

//print grad cert
const grad = asyncWrapper(
    async (req, res) => {
        const data = req.body;



        let year = parseInt(data.id.slice(0, 4), 10);

        if (year >= 2000 && year <= 2008) {
            let graduate = await db.graduate.findOne({
                where: {
                    NationalId: data.graduateID
                }
            });

            if (data.id != graduate.GraduateId) {
                return res.status(404).json({
                    "status": httpStatusText.ERROR,
                    "message": "No Graduate with this ID"
                });
            }

            let graduateData = graduate.dataValues;
            graduateData.issue_date = String(moment().format('YYYY-MM-DD'));

            let date = new Date(graduateData.StartDate);
            graduateData.StartDate = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
            date = new Date(graduateData.EndDate);
            graduateData.EndDate = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
            date = new Date(graduateData.BirthDate);
            graduateData.BirthDate = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;

            if (data.lang === 'Arabic') {
                graduateData = translateValues(graduateData, translationDict);
            }

            let templatePath = path.resolve(__dirname, '../documents/OldEnglishCert.docx');
            if (data.lang === 'Arabic') {
                templatePath = path.resolve(__dirname, '../documents/maleArabicCert.docx');
            }

            const content = fs.readFileSync(templatePath, "binary");
            const zip = new PizZip(content);
            const doc = new Docxtemplater(zip, {
                paragraphLoop: true,
                linebreaks: true,
            });

            doc.render(graduateData);

            const buf = doc.getZip().generate({
                type: 'nodebuffer',
                compression: 'DEFLATE',
            });

            const outputPath = path.resolve(__dirname, '../documents/' + String(graduateData.GraduateId) + 'Cert.docx');
            fs.writeFileSync(outputPath, buf);

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            res.setHeader('Content-Disposition', `attachment; filename=` + String(graduateData.GraduateId) + `Cert.docx`);
            return res.status(200).send(buf);
        } else {
            let graduate = await Graduate.findOne({
                where: {
                    NationalId: data.graduateID
                }
            });

            if (data.id != graduate.GraduateId) {
                return res.status(404).json({
                    "status": httpStatusText.ERROR,
                    "message": "No Graduate with this ID"
                });
            }

            let graduateData = graduate.dataValues;
            graduateData.issue_date = String(moment().format('YYYY-MM-DD'));

            let date = new Date(graduateData.StartDate);
            graduateData.StartDate = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
            date = new Date(graduateData.EndDate);
            graduateData.EndDate = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
            date = new Date(graduateData.BirthDate);
            graduateData.BirthDate = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;

            if (data.lang === 'Arabic') {
                graduateData = translateValues(graduateData, translationDict);
            }

            let templatePath = path.resolve(__dirname, '../documents/NewEnglishCert.docx');
            if (data.lang === 'Arabic') {
                templatePath = path.resolve(__dirname, '../documents/NewmaleArabicCert.docx');
            }

            const content = fs.readFileSync(templatePath, "binary");
            const zip = new PizZip(content);
            const doc = new Docxtemplater(zip, {
                paragraphLoop: true,
                linebreaks: true,
            });

            doc.render(graduateData);

            const buf = doc.getZip().generate({
                type: 'nodebuffer',
                compression: 'DEFLATE',
            });

            const outputPath = path.resolve(__dirname, '../documents/' + String(graduateData.GraduateId) + 'Cert.docx');
            fs.writeFileSync(outputPath, buf);

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            res.setHeader('Content-Disposition', `attachment; filename=` + String(graduateData.GraduateId) + `Cert.docx`);
            return res.status(200).send(buf);
        }

        return res.status(404).json("Error");
    }
);



// Print Verfication Letter
const verficationLetter =asyncWrapper(async (req,res)=> {
        const data = req.body;
        let yearOfgrad = parseInt(data.id.slice(0, 4), 10);

        if (yearOfgrad >= 2000 && yearOfgrad <= 2008) {
            let graduate = await db.graduate.findOne(
                {
                    where:
                        {NationalId:data.graduateID
                        }
                });
            if(data.id!=graduate.GraduateId){
                return  res.status(404).json({
                    "status": httpStatusText.ERROR,
                    "message": "No Graduate with this ID"
                })
            }
            let graduateData =graduate.dataValues
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

            let templatePath = path.resolve(__dirname, '../documents/OldEnglishLetter.docx')
            if(data.lang==='Arabic'){
                templatePath = path.resolve(__dirname,'../documents/efada_for_20060590_2.docx')
            }
            if (data.lang === 'Arabic') {
                graduateData = translateValues(graduateData, translationDict);
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
        }else{
            let graduate = await Graduate.findOne(
                {
                    where:{
                        NationalId:data.graduateID
                    }
                });
            if(data.id!=graduate.GraduateId){
                return  res.status(404).json({
                    "status": httpStatusText.ERROR,
                    "message": "No Graduate with this ID"
                })
            }

            let graduateData =graduate.dataValues
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
                templatePath = path.resolve(__dirname,'../documents/Arabic_new_efada.docx')
            }
            if (data.lang === 'Arabic') {
                graduateData = translateValues(graduateData, translationDict);
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



    }
);

const gradeReport =asyncWrapper(async ()=>{

}
);



module.exports ={
    grad,verficationLetter
}