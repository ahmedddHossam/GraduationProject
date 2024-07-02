const express = require('express');
const {body} = require('express-validator');
const profileController = require('../controllers/profileController')
const TokenManipulation = require("../utils/TokenManipulation");
const allowedTo = require("../middleware/allowedTo");
const router = express.Router();

router.route('/myprofile')
    .get(TokenManipulation.verifyToken,allowedTo(["Graduate"]),profileController.manageProfile)

module.exports=router;