const Student = require('../models/StudentModel')
const Grade = require('../models/GradeModel')

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
  const checkStudent = Student.findOne({
    $or: [
      { phone: { $regex: new RegExp(phone, 'i') } },
      { anotherphone: { $regex: new RegExp(anotherphone, 'i') } }
    ]
  });
  let code = ""

  const gradeCheck = await Grade.findOneAndUpdate(
    { gradeName: grade },
    { $inc: { reservationCount: 1 } },
    { new: true }
  );
  console.log("Entered Modules are: ", modules)
  console.log("Grade is: ", gradeCheck)
  console.log("Reservation Count is: ", gradeCheck.reservationCount)
  
  if(grade == "Baby Class"){
    code = "C-" + gradeCheck.reservationCount
    console.log("Grade is Baby Class")
  }
  else if (grade == "KG1"){
    code = "K1-" + gradeCheck.reservationCount
    console.log("Grade is KG1")
  }
  else if (grade == "KG2"){
    code = "K2-" + gradeCheck.reservationCount
    console.log("Grade is KG2")
  }
  else if (grade == "Prim 1"){
    code = "P1-0" + gradeCheck.reservationCount
    console.log("Grade is Prim 1")
  }
  else if (grade == "Prim 2"){
    code = "P2-0" + gradeCheck.reservationCount
    console.log("Grade is Prim 2")
  }
  else if (grade == "Prim 3"){
    code = "P3-0" + gradeCheck.reservationCount
    console.log("Grade is Prim 3")
  }
  else if (grade == "Prim 4"){
    code = "P4-0" + gradeCheck.reservationCount
    console.log("Grade is Prim 4")
  }
  else if (grade == "Prim 5"){
    code = "P5-0" + gradeCheck.reservationCount
    console.log("Grade is Prim 5")
  }
  else if (grade == "Prim 6"){
    code = "P6-0" + gradeCheck.reservationCount
    console.log("Grade is Prim 6")
  }
  else if (grade == "Prep 1"){
    code = "P7-0" + gradeCheck.reservationCount
    console.log("Grade is Prep 1")
  }
  else if (grade == "Prep 2"){
    code = "P8-0" + gradeCheck.reservationCount
    console.log("Grade is Prep 2")
  }
  else if (grade == "Prep 3"){
    code = "P9-0" + gradeCheck.reservationCount
    console.log("Grade is Prep 3")
  }

  const reservation = {
    code,
    grade,
    modules,
    copiesNumber,
    createdAt: new Date()
  };

  const student = await checkStudent.exec();

  if (student) {
    console.log("student found");
    student.reservations.push(reservation);
    await student.save();
    for (let i = 0; i < modules.length; i++) {
      for (let j = 0; j < gradeCheck.modules.length; j++) {
        if (modules[i] === gradeCheck.modules[j].moduleName) {
          const copiesCount = parseInt(copiesNumber[i]);
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
    console.log(gradeCheck.modules);
    console.log("student updated successfully");
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
            continue;
          }
        }
      }
    }
    gradeCheck.save()
    console.log(gradeCheck.modules);
    console.log(name, address, phone, anotherphone);
    console.log("Data inserted in Student Model Successfully..");
  }
};


const newReservation = async (req, res) => {
    const {name, address, phone, anotherphone, grade, modules, copiesNumber} = req.body
    console.log(name, address, phone, anotherphone, grade, modules, copiesNumber)
    console.log("Phone length:", phone.length);
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

          const nameRegex = /^\S+\s+\S+\s+\S+$/;
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
          console.log("Grade", grade)
          console.log("Modules", modules)
          console.log("Copies Number", copiesNumber)

          const reservationPromises = grade.map((g, index) => {
            return checkStudentAndHandleReservation(
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
          res.status(200).json({ message: "تم تسجيل الحجز بنجاح" });
            }
          } catch (error) {
            console.log("Catch error: ", error);
            res.status(400).json({ error: error });
          }
        };

const allreservations = async (req, res) => {
  await Student.find().sort({ 'reservations.createdAt': 1 })
  .then(student=>{
      res.json({student})
  })
  .catch(err=>{
      console.log(err)
  })
}

const updateStatus = async (req, res) => {
  const { id } = req.params;
  console.log("reservation id is: ", id);

  try {
    const student = await Student.findOne({ 'reservations._id': id });

    if (!student) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    const reservation = student.reservations.find((res) => res._id.toString() === id);

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    reservation.status = 'استلم';

    await student.save();
    console.log("Reservation status updated successfully")
    res.json({ message: 'Reservation status updated successfully' });
  } catch (error) {
    console.error('Error updating reservation status:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
const updateStatusFalse = async (req, res) => {
  const { id } = req.params;
  console.log("reservation id is: ", id);

  try {
    const student = await Student.findOne({ 'reservations._id': id });

    if (!student) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    const reservation = student.reservations.find((res) => res._id.toString() === id);

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    reservation.status = 'لم يستلم';

    await student.save();
    console.log("Reservation status updated successfully")
    res.json({ message: 'Reservation status updated successfully' });
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
module.exports = {newReservation, allreservations, updateStatus, updateStatusFalse, deleteReservation}