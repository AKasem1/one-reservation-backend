const express = require('express')
//4
const {loginAdmin, alladmins, getExcelPhones, getUniquePhones} = require('../controllers/adminController')

const router = express.Router()

router.get('/alladmins', alladmins)

router.post('/login', loginAdmin)
router.get('/excelPhones', getExcelPhones)
router.post('/uniquePhones/:gradeName', getUniquePhones)
router.get('/uniquePhones', getUniquePhones)

module.exports = router