const { Model } = require('sequelize')
const adminController = require('../controllers/adminController')
const express = require('express')
const router = express.Router()

router.get('/nominateTA/:Department', adminController.nominateTA)

module.exports = router