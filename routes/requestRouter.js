const { Model } = require('sequelize')
const requestController = require('../controllers/requestController')
const express = require('express')
const router = express.Router()
router.get('/', requestController.getAllRequests)
router.post('/sendRequest', requestController.sendRequest)



module.exports = router