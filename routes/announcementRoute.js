const express = require('express');
const route = express.Router();
const  announcementController= require('../controllers/announcementController')
const TokenManipulation = require("../utils/TokenManipulation");
const allowedTo = require("../middleware/allowedTo");

const router = express.Router()

router.route('/addAnnouncement')
    .post(TokenManipulation.verifyToken,allowedTo(["Post Graduate Studies Admin", "Graduate Affairs Admin", "Super Admin"]),announcementController.addAnnouncement)
router.route('/getAnnouncements')
    .get(announcementController.getAllAnnouncement)
router.route('/updateAnnouncement/:announceId')
    .patch(TokenManipulation.verifyToken,allowedTo(["Post Graduate Studies Admin", "Graduate Affairs Admin", "Super Admin"]),announcementController.updateAnnouncement)
router.route('/deleteAnnouncement/:announceId')
    .delete(TokenManipulation.verifyToken,allowedTo([ "Post Graduate Studies Admin", "Graduate Affairs Admin", "Super Admin"]),announcementController.deleteAnnouncement)

module.exports = router
