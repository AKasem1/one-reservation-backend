const Admin = require('../models/AdminModel')
const jwt = require('jsonwebtoken')
const Student = require('../models/StudentModel')
const mongoose = require('mongoose');
const ExcelJS = require('exceljs');

const createToken = (_id) => {
    return jwt.sign({_id: _id}, process.env.SECRET, {expiresIn: '3d'})
  }

const loginAdmin = async (req, res) => {
    console.log("here received request..s")
    const {username, password} = req.body
    console.log({username, password})
    try{
      if(!username || !password){
        throw Error('All fields are required.')
      }
      const admin = await Admin.findOne({username})
      if(!admin){
        throw Error('Wrong Username')
      }

      if(!(admin.password == password)){
        throw Error('Wrong Password')
      }
      const token = createToken(admin._id)
      console.log("Logged In Successfully..")
      res.status(200).json({username, token})
    }
    catch(error){
      console.log("Catch Error: Can not log ya abdo")
      res.status(400).json({error: error.message})
    }
  }
const alladmins = async (req, res) => {
    try{
      const admins = await Admin.find({});
      res.status(200).json(admins);
  
    } catch(error){
      console.log("Can not retrieve admins");
      res.status(400).json({ error: error.message });
    }
  }
  const getExcelPhones = async (req, res) =>{
    try {
      const students = await Student.find({}, 'name phone anotherphone');
      //console.log(students)

      const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Phone Numbers');

    worksheet.columns = [
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Another Phone', key: 'anotherphone', width: 15 },
    ];

    students.forEach((student) => {
      worksheet.addRow({
        name: student.name,
        phone: student.phone,
        anotherphone: student.anotherphone,
      });
    });
    console.log('Excel file saved');
    return workbook.xlsx.writeFile('phone_numbers.xlsx');
    } catch (error) {
      console.log("Catch Error: Can not log ya abdo")
      res.status(400).json({error: error.message}) 
    }
  }

module.exports = { loginAdmin, alladmins, getExcelPhones}