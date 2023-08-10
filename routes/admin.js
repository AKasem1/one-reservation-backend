const express = require('express')

const {loginAdmin, alladmins, getExcelPhones} = require('../controllers/adminController')

const router = express.Router()

router.get('/alladmins', alladmins)

router.post('/login', loginAdmin)
router.get('/excelPhones', getExcelPhones)

module.exports = router