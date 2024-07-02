const { Model } = require('sequelize')
const courseController = require('../controllers/courseController')
const express = require('express')
const router = express.Router()

router.post('/addCourse', courseController.addCourse)
router.get('/getCourses/:GraduateId', courseController.getCourses)

module.exports = router