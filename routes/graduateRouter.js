const { Model } = require('sequelize')
const graduateController = require('../controllers/graduateController')

const express = require('express')

const router = express.Router()

router.post('/addGraduate', graduateController.addGraduate)

module.exports = router