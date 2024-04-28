const { Model } = require('sequelize')
const graduateController = require('../controllers/graduateController')

const express = require('express')

const router = express.Router()

router.post('/addGraduate', graduateController.addGraduate)
router.get('/getGraduate/:GraduateId', graduateController.getOneGraduate)
router.get('/getAllGraduates', graduateController.getAllGraduates)
router.put('/updateGraduate/:GraduateId', graduateController.updateGraduate)
router.delete('/deleteGraduate/:GraduateId', graduateController.deleteGraduate)

module.exports = router