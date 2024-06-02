const express = require('express')
//4
const {loginAdmin, alladmins, addAdmin, getExcelPhones, getUniquePhones, mergedExcelFiles} = require('../controllers/adminController')

const router = express.Router()

router.get('/alladmins', alladmins)

router.post('/login', loginAdmin)
router.post('/addAdmin', addAdmin)
router.get('/excelPhones', getExcelPhones)
router.post('/uniquePhones/:gradeName', getUniquePhones)
router.get('/uniquePhones', getUniquePhones)
router.post('/mergedUniquePhones', mergedExcelFiles)

module.exports = router