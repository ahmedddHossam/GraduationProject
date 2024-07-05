const express = require('express');
const route = express.Router();
const analysisController = require('../controllers/analysisController')
const TokenManipulation = require("../utils/TokenManipulation");
const allowedTo = require("../middleware/allowedTo");

const router = express.Router()

router.route('/').get(analysisController.Analyze)

module.exports = router