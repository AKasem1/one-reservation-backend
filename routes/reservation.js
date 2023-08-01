const express = require("express")
const router = express.Router()
const mongoose = require('mongoose')
const requireAuth = require('../middleware/requireAuth')
const Student = require("../models/StudentModel")
const {newReservation} = require('../controllers/reservationController')
const {allreservations} = require('../controllers/reservationController')
const {updateStatus} = require('../controllers/reservationController')
const {updateStatusFalse} = require('../controllers/reservationController')
const {deleteReservation} = require('../controllers/reservationController')

router.post('/newReservation', newReservation)
router.get('/allreservations', allreservations)
router.patch('/updateStatus/:id', updateStatus)
router.patch('/updateStatusFalse/:id', updateStatusFalse)
router.delete('/deleteReservation/:id', deleteReservation)

module.exports = router;