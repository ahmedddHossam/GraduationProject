const express = require('express');
const {body} = require('express-validator');
const  {grad,verficationLetter} = require('../controllers/print.controller.js');
const router = express.Router();


router.route('/certificate')
    .post(grad)
router.route('/letter')
    .post(verficationLetter)


module.exports = router