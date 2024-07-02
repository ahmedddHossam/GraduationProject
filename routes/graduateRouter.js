const { Model } = require('sequelize')
const graduateController = require('../controllers/graduateController')
const multer = require('multer');
const TokenManipulation = require('../utils/TokenManipulation');
const allowedTo = require('../middleware/allowedTo')

const express = require('express')

const upload = multer({ dest: 'uploads/' });
const router = express.Router()


router.post('/addGraduatesFromFile', upload.single('file'), graduateController.addGraduatesFromFile);
router.get('/getAllGraduatesOfDepartment/:Department/:Year', graduateController.getAllGraduatesOfDepartment);
router.post('/addGraduate',
    // TokenManipulation.verifyToken,allowedTo(["Admin"]),
    graduateController.addGraduate)

router.get('/getGraduate/:GraduateId',
    TokenManipulation.verifyToken,allowedTo(["Admin"]),
    graduateController.getOneGraduate)

router.get('/getAllGraduates',
    TokenManipulation.verifyToken,allowedTo(["Admin"]),
    graduateController.getAllGraduates)

router.put('/updateGraduate/:GraduateId',
    TokenManipulation.verifyToken,allowedTo(["Admin"])
    ,graduateController.updateGraduate)

router.delete('/deleteGraduate/:GraduateId',
    TokenManipulation.verifyToken,allowedTo(["Admin"])
    ,graduateController.deleteGraduate)


module.exports = router