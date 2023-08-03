const express = require("express")
const router = express.Router()
const mongoose = require('mongoose')
const requireAuth = require('../middleware/requireAuth')
const {insertGrade, getAllGrades, getGrade, updateGrade, resetGrade} = require("../controllers/gradeController")

router.post('/addGrade', insertGrade)
router.get('/allgrades', getAllGrades)
router.get('/getGrade/:gradeName', getGrade)
router.put('/resetGrade/:gradeName', resetGrade)
router.put('/updateGrade', updateGrade)

module.exports = router;