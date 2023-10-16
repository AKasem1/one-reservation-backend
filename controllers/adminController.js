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
  const getUniquePhones = async (req, res) => {
    try {
      const {gradeName} = req.params;
      const students = await Student.find({ reservations: { $elemMatch: { grade: gradeName } } }, 'phone anotherphone');
      const phones = students.map((student) => student.phone);
      const anotherPhones = students.map((student) => student.anotherphone);
      //const uniquePhones = [...new Set([...phones, ...anotherPhones])];
      const uniquePhones = [...new Set([...phones])];
      const workbook = new ExcelJS.Workbook();
      let fileName = `${gradeName} Unique Phones` 
      const worksheet = workbook.addWorksheet(fileName);
      worksheet.columns = [
        { header: 'Phone', key: 'phone', width: 15 },
        { header: 'Grade', key: 'grade', width: 15 },
      ];
      uniquePhones.forEach((phone) => {
        worksheet.addRow({
          phone: phone,
          grade: gradeName
        })
      });
      console.log("Unique Phones Retrieved Successfully..")
      res.status(200).json("Unique Phones Retrieved Successfully..");
      return workbook.xlsx.writeFile(`${fileName}.xlsx`)
    } catch (error) {
      console.log("Catch Error: Can not get your unique data ya abdo");
      res.status(400).json({ error: error.message });
    }
  };
  const getExcelPhones = async (req, res) =>{
    try {
      const students = await Student.find({}, 'name phone anotherphone reservations');
      //console.log(students)

      const workbook = new ExcelJS.Workbook();
      let today = new Date().toLocaleDateString().replace(/\//g,'-')
    const worksheet = workbook.addWorksheet(today);
    const headerRowStyle = {
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '7393B3' },
      },
      font: {
        color: { argb: 'FFFFFF'},
        bold: true,
      },
    };
    const cellAlignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true
    }

    worksheet.columns = [
      { header: 'Code', key: 'code', width: 15 },
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Another Phone', key: 'anotherphone', width: 15 },
      { header: 'Address', key: 'address', width: 15 },
      { header: 'Grade', key: 'grade', width: 15 },
      { header: 'Modules', key: 'modules', width: 50 },
      { header: 'Copies Number', key: 'copiesNumber', width: 30 },
      { header: 'CreatedAt', key: 'createdAt', width: 20 },
    ];

    worksheet.getRow(1).eachCell({includeEmpty: false}, (cell) => {
      cell.style = headerRowStyle
      cell.alignment = cellAlignment
    })
    worksheet.eachRow((row) => {
      row.eachCell({includeEmpty: true}, (cell => {
        cell.alignment = cellAlignment
    }));
    })

    students.forEach((student) => {
      student.reservations.forEach((reservation) =>{
        worksheet.addRow({
          code: reservation.code,
          name: student.name,
          phone: student.phone,
          anotherphone: student.anotherphone,
          address: student.address,
          grade: reservation.grade,
          modules: reservation.modules,
          copiesNumber: reservation.copiesNumber,
          createdAt: reservation.createdAt,
        });
      })
    });
    console.log('Excel file saved');
    res.status(200).json("File Saved Successfully..")
    return workbook.xlsx.writeFile(`${today}.xlsx`);
    } catch (error) {
      console.log("Catch Error: Can not get your data ya abdo")
      res.status(400).json({error: error.message}) 
    }
  }

module.exports = { loginAdmin, alladmins, getExcelPhones, getUniquePhones}