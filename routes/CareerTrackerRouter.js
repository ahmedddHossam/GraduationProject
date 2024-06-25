const express = require('express');
const route = express.Router();
const careerController = require('../controllers/CareerTrackerController')
const TokenManipulation = require("../utils/TokenManipulation");
const allowedTo = require("../middleware/allowedTo");

const router = express.Router()

router.route('/')
    .post(TokenManipulation.verifyToken,allowedTo(['Graduate']),careerController.addSkills)
router.route('/:graduateId')
    .get(TokenManipulation.verifyToken,allowedTo(["Graduate","Admin"]),careerController.getSkills)
module.exports = router
