const { Model } = require('sequelize')
const adminController = require('../controllers/adminController')
const express = require('express')
const router = express.Router()
const TokenManipulation = require('../utils/TokenManipulation')
const allowTo = require("../middleware/allowedTo")
router.get('/nominateTA/:Department', TokenManipulation.verifyToken,allowTo(["Super Admin"]),adminController.nominateTA)

module.exports = router