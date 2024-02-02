const express = require("express")
const router = express.Router()
const mongoose = require('mongoose')
const requireAuth = require('../middleware/requireAuth')
const Student = require("../models/StudentModel")
const {newReservation} = require('../controllers/reservationController')
const {allreservations} = require('../controllers/reservationController')
const {updateStatus} = require('../controllers/reservationController')
const {deleteReservation} = require('../controllers/reservationController')
const {selectedGrade} = require('../controllers/reservationController')
const { searchReservations } = require('../controllers/reservationController');
const { sendWhatsAppMessage } = require('../controllers/reservationController');

router.post('/newReservation', newReservation);
router.get('/allreservations/', allreservations);
router.get('/selectedGrade/:selectedGrade', selectedGrade);
router.post('/updateStatus', updateStatus);
router.delete('/deleteReservation/:id', deleteReservation);
router.get('/search', searchReservations);
router.post('/whatsapp', sendWhatsAppMessage);

module.exports = router;