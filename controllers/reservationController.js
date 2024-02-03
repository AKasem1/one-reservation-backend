const Student = require('../models/StudentModel')
const Grade = require('../models/GradeModel')
const path = require('path');
const scriptPath = path.join(__dirname, 'whatsapp.py');
const {spawn} = require('child_process')

const checkStudent = async (phone, anotherphone) => {
  //console.log("phone, anotherphone ", phone, anotherphone)
  let queryConditions = [
    { phone: phone }
  ];
  
  if (anotherphone.length > 0) {
    queryConditions.push({ anotherphone: anotherphone });
  }
  const student = await Student.findOne({
    $or: queryConditions
  });

  //console.log("student is: ", student) 
  return student;
}
const checkStudentAndHandleReservation = async (
  name,
  address,
  phone,
  anotherphone,
  grade,
  modules,
  copiesNumber
) => {
  if (!grade) {
    console.log("Grade is null or undefined.");
    return;
  }
  
  let code = ""
  
  const student = await checkStudent(phone, anotherphone);

  const gradeCheck = await Grade.findOneAndUpdate(
    { gradeName: grade.gradeName },
    { $inc: { reservationCount: 1 } },
    { new: true }
  );
  //console.log("Entered Modules are: ", modules)
  //console.log("Grade is: ", gradeCheck)
  //console.log("Reservation Count is: ", gradeCheck.reservationCount)
 
  if(grade.gradeName == "Baby Class"){
    code = "C-" + gradeCheck.reservationCount
    //console.log("Grade is Baby Class")
  }
  else if(grade.gradeName[0] =="K"){
    code = grade.gradeName[0] + grade.gradeName[grade.gradeName.length - 1] + '-0' + gradeCheck.reservationCount
  }
  else if(grade.gradeName.startsWith("Prim")){
    code = grade.gradeName[0] + grade.gradeName[grade.gradeName.length - 1] + '-0' + gradeCheck.reservationCount
  }
  else{
    code = grade.gradeName[0] + (grade.gradeName[grade.gradeName.length - 1]/1 + 6)  + '-0' + gradeCheck.reservationCount;
  }
  const gradeN = grade.gradeName

  const reservation = {
    code,
    grade: gradeN,
    modules,
    copiesNumber,
    createdAt: new Date()
  };

  //console.log(student)
  if (student) {
    console.log("student found");
    student.reservations.push(reservation);
    await student.save();
    for (let i = 0; i < modules.length; i++) {
      for (let j = 0; j < gradeCheck.modules.length; j++) {
        if (modules[i] === gradeCheck.modules[j].moduleName) {
          const copiesCount = Number(copiesNumber[i]);
          if (Number.isInteger(copiesCount)) {
            gradeCheck.modules[j].reservedDocuments.push(student._id);
            gradeCheck.modules[j].reservationCount =
              gradeCheck.modules[j].reservationCount + copiesCount;
          } else {
            console.log("Invalid copiesNumber value at index", i, ":", copiesNumber[i]);
            continue;
          }
        }
      }
    }
    
    gradeCheck.save()
    //console.log(gradeCheck.modules);
    console.log("student updated successfully");
    sendWhatsAppMessage(name, phone, grade.gradeName, code)
    return student;
  } else {
    console.log('No student found.');
    const newStudent = await Student.create({
      name,
      address,
      phone,
      anotherphone,
      reservations: [reservation]
    });
    await newStudent.save()
    console.log("Student Saved..")
    for (let i = 0; i < modules.length; i++) {
      for (let j = 0; j < gradeCheck.modules.length; j++) {
        if (modules[i] === gradeCheck.modules[j].moduleName) {
          const copiesCount = parseInt(copiesNumber[i]);
          if (Number.isInteger(copiesCount)) {
            gradeCheck.modules[j].reservedDocuments.push(newStudent._id);
            gradeCheck.modules[j].reservationCount =
              gradeCheck.modules[j].reservationCount + copiesCount;
          } else {
            console.log("Invalid copiesNumber value at index", i, ":", copiesNumber[i]);
          }
        }
      }
    }
    gradeCheck.save()
    //console.log(gradeCheck.modules);
    //console.log(name, address, phone, anotherphone);
    console.log("Data inserted in Student Model Successfully..");
    sendWhatsAppMessage(name, phone, grade.gradeName, code)
    return newStudent;
  }
  // sendWhatsAppMessage(name, phone, grade.gradeName, code)
};


const newReservation = async (req, res) => {
    const {name, address, phone, anotherphone, grade, modules, copiesNumber} = req.body
    //console.log(name, address, phone, anotherphone, grade, modules, copiesNumber)
    //console.log("Phone length:", phone.length);
    try {
        if (!name || !phone || !grade || !modules || !copiesNumber) {
          console.log("Please Add All Fields..");
          return res.status(422).json({ error: "Please Add All Fields.." });
        } else {
          if (phone.length !== 11) {
              console.log("Phone numbers should have exactly 11 digits.");
              return res
              .status(422)
              .json({ error: "Phone numbers should have exactly 11 digits." });
          }

          const nameRegex = /^(?:\S*\s){2}/;
          if (!nameRegex.test(name)) {
              console.log("Name should consist of three names separated by two spaces.");
              return res
                  .status(422)
                  .json({ error: "Name should consist of three names separated by two spaces." });
          }
        
          const digitsRegex = /^\d+$/;
          console.log("Is phone valid:", digitsRegex.test(phone));
          console.log("Is anotherphone valid:", digitsRegex.test(anotherphone));
          if (!digitsRegex.test(phone)) {
            console.log("Phone numbers should consist of digits only.");
            return res
              .status(422)
              .json({ error: "Phone numbers should consist of digits only." });
          }

          if(!phone.startsWith("01")){
            console.log("You can reserve with Egyptian Numbers only..")
            return res.status(422).json({ error: "You can reserve with Egyptian Numbers only.." });
          }

          if (phone === anotherphone) {
            console.log("Phone numbers should be different.");
            return res
              .status(422)
              .json({ error: "Phone numbers should be different." });
          }
          //console.log("Grade: ", grade)
          //console.log("Modules", modules)
          //console.log("Copies Number", copiesNumber)

          const reservationPromises = grade.map(async(g, index) => {
            return await checkStudentAndHandleReservation(
              name,
              address,
              phone,
              anotherphone,
              g,
              modules[index],
              copiesNumber[index]
            );
          });
          await Promise.all(reservationPromises);
          console.log('reservationPromises: ', reservationPromises)
          
          res.status(200).json({ message: "تم تسجيل الحجز بنجاح" });
            }
          } catch (error) {
            console.log("Catch error: ", error);
            res.status(400).json({ error: error });
          }
        };

        const allreservations = async (req, res) => {
          const { reservationsPerPage = 25, currentPage = 1 } = req.query;
          console.log("reservationsPerPage is: ", reservationsPerPage);
          console.log("current page is: ", currentPage);
          const skip = (currentPage - 1) * reservationsPerPage;
          const result = await Student.aggregate([
            {
            $project: {
              _id: 0,
              reservationsPerPage: { $size: '$reservations' }
            }
          },
          {
            $group: {
              _id: null,
              totalReservations: { $sum: '$reservationsPerPage' }
            }
          },
          {
            $sort: { createdAt: -1 }
          }
        ]);
        
          const totalReservations = result.length > 0 ? result[0].totalReservations : 0;
          console.log("Total Reservations: ", totalReservations);
          console.log("length: ", result);
          
          await Student.find().skip(skip).limit(reservationsPerPage)
          .then(student=>{
            console.log("Here your reservations")
              res.json({student, totalReservations})
          })
          .catch(err=>{
              console.log(err)
          })
        }
const selectedGrade = async (req, res) => {
  const { selectedGrade } = req.params;
  console.log("selected grade is: ", selectedGrade);
  try {
    const reservations = await Student.aggregate([
      { $unwind: "$reservations" },
      { $match: { "reservations.grade": selectedGrade } },
      { $sort: { "reservations.createdAt": -1 } },
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          address: { $first: "$address" },
          phone: { $first: "$phone" },
          anotherphone: { $first: "$anotherphone" },
          reservations: { $push: "$reservations" },
          createdAt: { $first: "$reservations.createdAt" } // add createdAt to the group stage
        },
      },
      { $sort: { createdAt: -1 } } // sort by createdAt
    ]);
    console.log("Filtered reservations:", reservations);
    res.json({message: "here your filter reservations: ", reservations });
  } catch (error) {
    console.error('Error in retrieving the filtered reservations:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateStatus = async (req, res) => {
  const {id, status} = req.body
    console.log({id, status})

  try {
    const student = await Student.findOne({ 'reservations._id': id });
    console.log("student is: ", student)

    if (!student) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    let reservation = student.reservations.find((res) => res._id.toString() === id);

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    if(status === 'استلم'){
      reservation.status = 'استلم';
    }
    else if(status === 'لم يستلم'){
      reservation.status = 'لم يستلم';
    }

    await student.save();
    console.log("Reservation status updated successfully")
    res.json({ message: 'Reservation status updated successfully', id, status});
  } catch (error) {
    console.error('Error updating reservation status:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteReservation = async(req, res) => {
  const { id } = req.params;
  console.log("reservation id is: ", id);
  try {
    const student = await Student.findOne({ 'reservations._id': id });
    if (!student) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    const reservationIndex = student.reservations.findIndex((res) => res._id.toString() === id);
    if (reservationIndex === -1) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    const reservation = student.reservations[reservationIndex];
    const grade = await Grade.findOne({ gradeName: reservation.grade });
    if (!grade) {
      return res.status(404).json({ error: 'Grade not found' });
    }
    reservation.modules.forEach((moduleName, index) => {
      const moduleIndex = grade.modules.findIndex((module) => module.moduleName === moduleName);
      if (moduleIndex !== -1) {
        grade.modules[moduleIndex].reservationCount -= reservation.copiesNumber[index];
        const studentIndex = grade.modules[moduleIndex].reservedDocuments.findIndex(studentId => studentId.equals(student._id));
        if (studentIndex !== -1) {
          grade.modules[moduleIndex].reservedDocuments.splice(studentIndex, 1);
        }
      }
    });
    await grade.save();
    console.log("Reservation Count updated successfully..")
    student.reservations.splice(reservationIndex, 1);
    console.log("reservation length: ", student.reservations.length)
    if(student.reservations.length == 0){
      await Student.deleteOne({ _id: student._id });
      return res.json({ message: 'Student document deleted successfully' });
    }
    else{
      await student.save();
    }
    res.json({ message: 'Reservation deleted successfully' });
  } catch (error) {
    console.error('Error in deleting reservation:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
const searchReservations = async (req, res) => {
  const { query } = req.query;
  console.log("query is: ", query);

  try {
    const searchResults = await Student.find({
      $or: [
        { name: { $regex: query, $options: 'i' } }, // Case-insensitive name search
        { phone: { $regex: query, $options: 'i' } }, // Case-insensitive phone search
        { anotherphone: { $regex: query, $options: 'i' } }, // Case-insensitive anotherphone search
        { 'reservations.code': { $regex: query, $options: 'i' } }, // Case-insensitive code search
      ],
    });

    res.json({ message: 'Search results:', results: searchResults });
  } catch (error) {
    console.error('Error in search query:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const sendWhatsAppMessage = async (name, phone, grade, code) => {
  try {
    const body = `تم حجز بوكليت فيوتشر للفصل الدراسي الثاني باسم  ${name}
    المرحلة: ${grade}
    كود الحجز: ${code}`
    const receiver = phone
    const currentDate = new Date();
    const currentHour = currentDate.getHours();
    const currentMinute = currentDate.getMinutes();
    console.log(`Current Time: ${currentHour}:${currentMinute}`);
    const childPython = spawn('python', [scriptPath, receiver, body, currentHour, currentMinute+1])
    
    childPython.stdout.on('data', (data)=>{
      console.log(`stdout: ${data}`)
    })

    childPython.stderr.on('data', (data)=>{
      console.log(`stderr: ${data}`)
    })

    childPython.on('close', (code)=>{
      console.log(`child process exited with code: ${code}`)
    })

    console.log("message should be sent")
    
    
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
  }
};
module.exports = {newReservation, sendWhatsAppMessage, allreservations, updateStatus, deleteReservation, selectedGrade, searchReservations}