const express = require('express');
const {body} = require('express-validator');
const  {grad,verficationLetter} = require('../controllers/print.controller.js');
const TokenManipulation = require("../utils/TokenManipulation");
const allowedTo = require("../middleware/allowedTo");
const router = express.Router();


router.route('/certificate')
    .post(TokenManipulation.verifyToken,allowedTo(["Graduate Affairs Admin"])
        ,grad)
router.route('/letter')
    .post(TokenManipulation.verifyToken,allowedTo(["Graduate Affairs Admin"])
        ,verficationLetter)


module.exports = router