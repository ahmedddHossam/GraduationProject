const { Model } = require('sequelize')
const graduateController = require('../controllers/oldBaylawGraduateController')
const multer = require('multer');
const TokenManipulation = require('../utils/TokenManipulation');
const allowedTo = require('../middleware/allowedTo')

const express = require('express')

const upload = multer({ dest: 'uploads/' });
const router = express.Router()


router.post('/addGraduateCourseFromFile', upload.single('file'), graduateController.addGraduateCourseFromFile);
router.post('/addGraduatesFromFile', upload.single('file'), graduateController.addGraduateFromFile);
router.post('/addGraduate', graduateController.addGraduate);
router.patch('/updateGradute',graduateController.updateGraduate)

module.exports = router
