const express = require('express');
const route = express.Router();
const careerController = require('../controllers/CareerTrackerController')
const TokenManipulation = require("../utils/TokenManipulation");
const allowedTo = require("../middleware/allowedTo");

const router = express.Router()

router.route('/addSkills')
    .post(TokenManipulation.verifyToken,allowedTo(['Graduate']),careerController.addSkills)
router.route('/skills/:graduateId')
    .get(TokenManipulation.verifyToken,allowedTo(["Graduate","Admin"]),careerController.getSkills)
router.route('/updatePosition')
    .post(TokenManipulation.verifyToken,allowedTo(['Graduate']),careerController.updatePosition)
router.route('/getPositions/:graduateId')
    .get(TokenManipulation.verifyToken,allowedTo(["Graduate","Admin"]),careerController.getPositions)

module.exports = router
