const { Model } = require('sequelize')
const courseController = require('../controllers/courseController')
const express = require('express')
const router = express.Router()
const TokenManipulation = require("../utils/TokenManipulation");
const allowedTo = require("../middleware/allowedTo");


router.post('/addCourse', TokenManipulation.verifyToken,allowedTo([ "Post Graduate Studies Admin", "Graduate Affairs Admin", "Super Admin"]),courseController.addCourse)

router.get('/getCourses/:GraduateId', TokenManipulation.verifyToken,allowedTo([ "Post Graduate Studies Admin", "Graduate Affairs Admin", "Super Admin"]) ,courseController.getCourses)

module.exports = router