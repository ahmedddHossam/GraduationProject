const { Model } = require('sequelize')
const graduateController = require('../controllers/graduateController')
const multer = require('multer');
const TokenManipulation = require('../utils/TokenManipulation');
const allowedTo = require('../middleware/allowedTo')

const express = require('express')

const upload = multer({ dest: 'uploads/' });
const router = express.Router()


router.post('/addGraduatesFromFile', upload.single('file'),TokenManipulation.verifyToken,
    allowedTo(["Graduate Affairs Admin"]) , graduateController.addGraduatesFromFile);

router.post('/addGraduatesCourseFromFile', upload.single('file'),
    TokenManipulation.verifyToken,allowedTo(["Graduate Affairs Admin"])
    , graduateController.addGraduateCourseFromFile);


router.get('/getAllGraduatesOfDepartment/:Department/:Year',
    TokenManipulation.verifyToken,allowedTo(["Graduate Affairs Admin"])
    , graduateController.getAllGraduatesOfDepartment);

router.post('/addGraduate',
    TokenManipulation.verifyToken,allowedTo([ "Graduate Affairs Admin"])
    ,
    graduateController.addGraduate)

router.get('/getGraduate/:NationalId',
    TokenManipulation.verifyToken,allowedTo([ "Graduate Affairs Admin"])
    ,
    graduateController.getOneGraduate)

router.get('/getAllGraduates',
    TokenManipulation.verifyToken,allowedTo(["Graduate Affairs Admin"])
    ,
    graduateController.getAllGraduates)

router.put('/addCourseToGraduate/:NationalId',
    TokenManipulation.verifyToken,allowedTo([ "Graduate Affairs Admin"])
    ,graduateController.addCourseToGraduate)

router.put('/updateGraduate/:NationalId',
    TokenManipulation.verifyToken,allowedTo([ "Graduate Affairs Admin"])
    ,graduateController.updateGraduate)

router.delete('/deleteCourse/:NationalId/:courseId',
    TokenManipulation.verifyToken,allowedTo(["Graduate Affairs Admin"])
    ,graduateController.deleteCourse)


module.exports = router