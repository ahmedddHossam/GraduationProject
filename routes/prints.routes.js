const express = require('express');
const {body} = require('express-validator');
const  {grad} = require('../controllers/print.controller.js');
const router = express.Router();


router.route('/')
    .post(grad) // get all the data from server


module.exports = router