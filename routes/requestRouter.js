const { Model } = require('sequelize')
const requestController = require('../controllers/requestController')
const express = require('express')
const router = express.Router()

router.post('/sendRequest', requestController.sendRequest)
router.post('/sendResponse/:requestId', requestController.sendResponse)

module.exports = router