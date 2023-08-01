const express = require('express')

const {loginAdmin, alladmins} = require('../controllers/adminController')

const router = express.Router()

router.get('/alladmins', alladmins)

router.post('/login', loginAdmin)

module.exports = router