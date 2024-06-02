const Admin = require('../models/AdminModel')
const jwt = require('jsonwebtoken')
const Student = require('../models/StudentModel')
const mongoose = require('mongoose');
const ExcelJS = require('exceljs');
const fs = require('fs');

const createToken = (_id) => {
    return jwt.sign({_id: _id}, process.env.SECRET, {expiresIn: '3d'})
  }
const addAdmin = async (req, res) => {
  const {username, password} = req.body
  try{
    if(!username || !password){
      throw Error('All fields are required.')
    }
    const admin = new Admin({username, password})
    await admin.save()
    console.log("Admin Added Successfully..")
    res.status(201).json(admin)
  }
  catch(error){
    console.log("Catch Error: Can not add your admin ya abdo")
    res.status(400).json({error: error.message})
  }
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
      let students;
      if(gradeName){
        students = await Student.find({ reservations: { 
                                            $elemMatch: { grade: gradeName } } }, 
                                            'phone anotherphone');  
      }
      else{students = await Student.find()}
      
      const phones = students.map((student) => student.phone);
      const anotherPhones = students.map((student) => student.anotherphone);
      //const uniquePhones = [...new Set([...phones, ...anotherPhones])];
      const uniquePhones = [...new Set([...phones])];
      const workbook = new ExcelJS.Workbook();
      let fileName;
      if(gradeName){
        fileName = `${gradeName} Unique Phones`
      }
      else{
        fileName = `Future Unique Phones`
      }
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

  const mergedExcelFiles = async (req, res) => {
    try {
    const { file1, file2 } = req.body;
    console.log({file1, file2})
    console.log('Current working directory:', process.cwd());
    if (!fs.existsSync(file1) || !fs.existsSync(file2)) {
      throw new Error("A7a File not found");
    }

    const workbook1 = new ExcelJS.Workbook();
    await workbook1.xlsx.readFile(file1);

    const workbook2 = new ExcelJS.Workbook();
    await workbook2.xlsx.readFile(file2);

    // Create a Set to store unique phone numbers
    const uniquePhoneNumbers = new Set();

    workbook1.eachSheet((worksheet, sheetId) => {
      worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
          const phoneNumber = row.getCell(1).value; // Assuming phone numbers are in the first column
          if (phoneNumber) {
              uniquePhoneNumbers.add(phoneNumber);
          }
      });
  });
  workbook2.eachSheet((worksheet, sheetId) => {
      worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
          const phoneNumber = row.getCell(1).value; // Assuming phone numbers are in the first column
          if (phoneNumber) {
              uniquePhoneNumbers.add(phoneNumber);
          }
      });
  });
    const mergedWorkbook = new ExcelJS.Workbook();
    const mergedWorksheet = mergedWorkbook.addWorksheet('MergedSheet');

    uniquePhoneNumbers.forEach((phoneNumber) => {
    mergedWorksheet.addRow([phoneNumber]);
    });
    console.log("Merged Unique Phones Retrieved Successfully..")
      res.status(200).json("Merged Unique Phones Retrieved Successfully..");
      return mergedWorkbook.xlsx.writeFile(`mergedFiles.xlsx`)}
      catch (error) {
        console.log("Catch Error: Can not get your merged unique data ya abdo");
        res.status(400).json({ error: error.message });
      }
  }

  const getExcelPhones = async (req, res) =>{
    try {
      const students = await Student.find({}, 'name phone address anotherphone reservations');
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

module.exports = { loginAdmin, alladmins, addAdmin, getExcelPhones, getUniquePhones, mergedExcelFiles}