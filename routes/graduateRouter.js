const { Model } = require('sequelize')
const graduateController = require('../controllers/graduateController')
const multer = require('multer');
const express = require('express')

const upload = multer({ dest: 'uploads/' });
const router = express.Router()

router.post('/addGraduate', graduateController.addGraduate)
router.post('/addGraduatesFromFile', upload.single('file'), graduateController.addGraduatesFromFile);
router.get('/getAllGraduatesOfDepartment/:Department/:Year', graduateController.getAllGraduatesOfDepartment);
router.get('/getGraduate/:GraduateId', graduateController.getOneGraduate)
router.get('/getAllGraduates', graduateController.getAllGraduates)
router.put('/updateGraduate/:GraduateId', graduateController.updateGraduate)
router.delete('/deleteGraduate/:GraduateId', graduateController.deleteGraduate)

module.exports = router