const { Model } = require('sequelize')
const graduateController = require('../controllers/oldBaylawGraduateController')
const multer = require('multer');
const TokenManipulation = require('../utils/TokenManipulation');
const allowedTo = require('../middleware/allowedTo')

const express = require('express')

const upload = multer({ dest: 'uploads/' });
const router = express.Router()


router.post('/addGraduateCourseFromFile', upload.single('file'),
    TokenManipulation.verifyToken,allowedTo([ "Graduate Affairs Admin"])
    ,graduateController.addGraduateCourseFromFile);


router.post('/addGraduatesFromFile', upload.single('file'),
    TokenManipulation.verifyToken,allowedTo([ "Graduate Affairs Admin"])
    ,graduateController.addGraduateFromFile);

router.post('/addGraduate',
    TokenManipulation.verifyToken,allowedTo([ "Graduate Affairs Admin"])
    ,graduateController.addGraduate);


router.patch('/updateGradute',
    TokenManipulation.verifyToken,allowedTo(["Post Graduate Studies Admin", "Graduate Affairs Admin"])
    ,graduateController.updateGraduate)

module.exports = router
