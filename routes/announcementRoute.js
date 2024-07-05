const express = require('express');
const route = express.Router();
const  announcementController= require('../controllers/announcementController')
const TokenManipulation = require("../utils/TokenManipulation");
const allowedTo = require("../middleware/allowedTo");

const router = express.Router()

router.route('/addAnnouncement')
    .post(TokenManipulation.verifyToken,allowedTo(['Admin']),announcementController.addAnnouncement)
router.route('/getAnnouncements')
    .get(announcementController.getAllAnnouncement)
router.route('/updateAnnouncement/:announceId')
    .patch(TokenManipulation.verifyToken,allowedTo(['Admin']),announcementController.updateAnnouncement)
router.route('/deleteAnnouncement/:announceId')
    .delete(TokenManipulation.verifyToken,allowedTo(["Admin"]),announcementController.deleteAnnouncement)

module.exports = router
