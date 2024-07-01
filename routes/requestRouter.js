const { Model } = require('sequelize')
const requestController = require('../controllers/requestController')
const express = require('express')
const TokenManipulation = require("../utils/TokenManipulation");
const allowedTo = require("../middleware/allowedTo");
const router = express.Router()
router.get('/',TokenManipulation.verifyToken,allowedTo(["Graduate"]), requestController.getAllRequests)
router.get('/myRequests',TokenManipulation.verifyToken,allowedTo(["Graduate"]), requestController.getUserRequests)
router.post('/sendRequest' ,TokenManipulation.verifyToken,allowedTo(["Graduate"]),requestController.sendRequest)



module.exports = router